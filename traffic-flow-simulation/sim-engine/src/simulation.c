#include "simulation.h"
#include "routing.h"
#include "streets.h"

#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void enqueue_existing_car(Street *street, CarNode *car) {
    car->next = NULL;
    if (street->queue_rear == NULL) {
        street->queue_front = car;
        street->queue_rear = car;
    } else {
        street->queue_rear->next = car;
        street->queue_rear = car;
    }
    street->queue_count++;
}

static void enqueue_new_car(Street *street, int *next_car_id) {
    if (street->queue_count >= street->queue_capacity) {
        return;
    }

    CarNode *new_car = (CarNode *)malloc(sizeof(CarNode));
    if (new_car == NULL) {
        fprintf(stderr, "Failed to allocate car node.\n");
        exit(EXIT_FAILURE);
    }

    new_car->car_id = (*next_car_id)++;
    new_car->next = NULL;
    enqueue_existing_car(street, new_car);
}

static CarNode *dequeue_car(Street *street) {
    if (street->queue_front == NULL) {
        return NULL;
    }

    CarNode *car = street->queue_front;
    street->queue_front = car->next;
    if (street->queue_front == NULL) {
        street->queue_rear = NULL;
    }
    car->next = NULL;
    street->queue_count--;
    return car;
}

void initialize_street(
    Street *street,
    const char *name,
    double red_time,
    double green_time,
    int queue_capacity,
    int starts_green,
    int cars_per5min,
    int stop_sign,
    int *next_car_id
) {
    strncpy(street->name, name, sizeof(street->name) - 1);
    street->name[sizeof(street->name) - 1] = '\0';
    street->queue_capacity = queue_capacity;
    street->queue_count = 0;
    street->queue_front = NULL;
    street->queue_rear = NULL;
    street->greenlight_time = green_time;
    street->redlight_time = red_time;
    street->timer = 0.0;
    street->is_green = starts_green;
    street->cars_per5min = cars_per5min;
    street->time_since_last_add = 0.0;
    street->stop_sign = stop_sign;

    int seed_cars = cars_per5min / 5;
    for (int i = 0; i < seed_cars; i++) {
        enqueue_new_car(street, next_car_id);
    }
}

void initialize_default_streets(Street streets[NUM_STREETS], double time_ratio, int *next_car_id) {
    initialize_street(&streets[0],  "Lasalle 1",    54.0 * time_ratio,  25.0 * time_ratio, 29, 1,  5, 0, next_car_id);
    initialize_street(&streets[1],  "Lasalle 2",     0.0,               0.0,               29, 1,  3, 1, next_car_id);
    initialize_street(&streets[2],  "Dale 3",        0.0,               0.0,               17, 1,  3, 1, next_car_id);
    initialize_street(&streets[3],  "Farmington 1", 45.0 * time_ratio,  30.0 * time_ratio, 40, 0, 13, 0, next_car_id);
    initialize_street(&streets[4],  "Farmington 2", 25.0 * time_ratio,  54.0 * time_ratio, 42, 0, 31, 0, next_car_id);
    initialize_street(&streets[5],  "Brace 1",      30.0 * time_ratio,  40.0 * time_ratio, 43, 0,  9, 0, next_car_id);
    initialize_street(&streets[6],  "Brace 2",       0.0,               0.0,               43, 0,  6, 1, next_car_id);
    initialize_street(&streets[7],  "Memorial 3",  135.0 * time_ratio, 104.0 * time_ratio, 21, 0, 10, 0, next_car_id);
    initialize_street(&streets[8],  "S Main 1",    105.0 * time_ratio,  40.0 * time_ratio, 54, 1, 40, 0, next_car_id);
    initialize_street(&streets[9],  "S Main 2",    104.0 * time_ratio, 135.0 * time_ratio, 54, 1,  7, 0, next_car_id);
    initialize_street(&streets[10], "N Main 1",     40.0 * time_ratio,  30.0 * time_ratio,  9, 1, 17, 0, next_car_id);
    initialize_street(&streets[11], "N Main 2",    105.0 * time_ratio,  40.0 * time_ratio,  9, 1, 42, 0, next_car_id);
}

void update_light(Street *street) {
    if (street->stop_sign) {
        street->is_green = 1;
        return;
    }

    street->timer += 1.0;
    if (street->is_green && street->timer >= street->greenlight_time) {
        street->is_green = 0;
        street->timer = 0.0;
    } else if (!street->is_green && street->timer >= street->redlight_time) {
        street->is_green = 1;
        street->timer = 0.0;
    }
}

void add_cars_from_data_cycle(Street *street, double data_cycle, int *next_car_id) {
    double normalized_cars = street->cars_per5min * data_cycle;
    if (normalized_cars <= 0.0) {
        return;
    }

    double interval = (double)ENGINE_TICKS / normalized_cars;
    street->time_since_last_add += 1.0;
    if (street->time_since_last_add >= interval) {
        enqueue_new_car(street, next_car_id);
        street->time_since_last_add = 0.0;
    }
}

int move_car(Street *current_street, int street_index, Street streets[NUM_STREETS]) {
    if (!current_street->stop_sign && !current_street->is_green) {
        return 0;
    }

    CarNode *moving_car = dequeue_car(current_street);
    if (moving_car == NULL) {
        return 0;
    }

    double rand_percent = rand() / (double)RAND_MAX;
    int destination_index = choose_destination_index(street_index, rand_percent);

    if (destination_index >= 0 && destination_index < NUM_STREETS &&
        streets[destination_index].queue_count < streets[destination_index].queue_capacity) {
        enqueue_existing_car(&streets[destination_index], moving_car);
        return 1;
    }

    free(moving_car);
    return 0;
}

static int total_network_cars(Street streets[NUM_STREETS]) {
    int total = 0;
    for (int i = 0; i < NUM_STREETS; i++) {
        total += streets[i].queue_count;
    }
    return total;
}

static double average_fullness_pct(Street streets[NUM_STREETS]) {
    double total = 0.0;
    for (int i = 0; i < NUM_STREETS; i++) {
        total += ((double)streets[i].queue_count / (double)streets[i].queue_capacity) * 100.0;
    }
    return total / (double)NUM_STREETS;
}

void free_all_queues(Street streets[NUM_STREETS]) {
    for (int i = 0; i < NUM_STREETS; i++) {
        CarNode *current = streets[i].queue_front;
        while (current != NULL) {
            CarNode *next = current->next;
            free(current);
            current = next;
        }
        streets[i].queue_front = NULL;
        streets[i].queue_rear = NULL;
        streets[i].queue_count = 0;
    }
}

void run_simulation_json(FILE *out, int represented_seconds, unsigned int seed) {
    srand(seed);

    double data_cycle = (double)represented_seconds / 300.0;
    if (data_cycle <= 0.0) {
        data_cycle = 1.0;
    }
    double time_ratio = 0.2 * data_cycle;
    int movement_cycles = (int)ceil(data_cycle);
    if (movement_cycles < 1) {
        movement_cycles = 1;
    }

    Street streets[NUM_STREETS];
    int next_car_id = 1;
    initialize_default_streets(streets, time_ratio, &next_car_id);

    int peak_network_cars = 0;
    char peak_congestion_street[32] = "N/A";
    double peak_congestion_pct = 0.0;

    fprintf(out, "{\n");
    fprintf(out, "  \"metadata\": {\n");
    fprintf(out, "    \"represented_seconds\": %d,\n", represented_seconds);
    fprintf(out, "    \"data_cycle\": %.4f,\n", data_cycle);
    fprintf(out, "    \"time_ratio\": %.4f,\n", time_ratio);
    fprintf(out, "    \"engine_ticks\": %d,\n", ENGINE_TICKS);
    fprintf(out, "    \"movement_cycles_per_tick\": %d,\n", movement_cycles);
    fprintf(out, "    \"seed\": %u\n", seed);
    fprintf(out, "  },\n");

    fprintf(out, "  \"streets\": [\n");
    for (int i = 0; i < NUM_STREETS; i++) {
        fprintf(
            out,
            "    {\"name\": \"%s\", \"queue_capacity\": %d, \"cars_per5min\": %d, \"control_type\": \"%s\"}%s\n",
            streets[i].name,
            streets[i].queue_capacity,
            streets[i].cars_per5min,
            control_type_for_street(&streets[i]),
            (i == NUM_STREETS - 1) ? "" : ","
        );
    }
    fprintf(out, "  ],\n");

    fprintf(out, "  \"snapshots\": [\n");
    for (int tick = 0; tick < ENGINE_TICKS; tick++) {
        for (int cycle = 0; cycle < movement_cycles; cycle++) {
            for (int i = 0; i < NUM_STREETS; i++) {
                update_light(&streets[i]);
                move_car(&streets[i], i, streets);
            }
        }

        for (int i = 0; i < NUM_STREETS; i++) {
            add_cars_from_data_cycle(&streets[i], data_cycle, &next_car_id);
        }

        int network_cars = total_network_cars(streets);
        if (network_cars > peak_network_cars) {
            peak_network_cars = network_cars;
        }

        fprintf(out, "    {\n");
        fprintf(out, "      \"tick\": %d,\n", tick + 1);
        fprintf(out, "      \"network\": {\n");
        fprintf(out, "        \"total_cars\": %d,\n", network_cars);
        fprintf(out, "        \"avg_fullness_pct\": %.2f\n", average_fullness_pct(streets));
        fprintf(out, "      },\n");
        fprintf(out, "      \"street_states\": [\n");

        for (int i = 0; i < NUM_STREETS; i++) {
            double fullness_pct = ((double)streets[i].queue_count / (double)streets[i].queue_capacity) * 100.0;
            if (fullness_pct > peak_congestion_pct) {
                peak_congestion_pct = fullness_pct;
                strncpy(peak_congestion_street, streets[i].name, sizeof(peak_congestion_street) - 1);
                peak_congestion_street[sizeof(peak_congestion_street) - 1] = '\0';
            }

            fprintf(
                out,
                "        {\"name\": \"%s\", \"queue_count\": %d, \"queue_capacity\": %d, \"fullness_pct\": %.2f, \"light\": \"%s\", \"control_type\": \"%s\", \"cars_per5min\": %d}%s\n",
                streets[i].name,
                streets[i].queue_count,
                streets[i].queue_capacity,
                fullness_pct,
                streets[i].stop_sign ? "STOP" : (streets[i].is_green ? "GREEN" : "RED"),
                control_type_for_street(&streets[i]),
                streets[i].cars_per5min,
                (i == NUM_STREETS - 1) ? "" : ","
            );
        }

        fprintf(out, "      ]\n");
        fprintf(out, "    }%s\n", (tick == ENGINE_TICKS - 1) ? "" : ",");
    }
    fprintf(out, "  ],\n");

    fprintf(out, "  \"summary\": {\n");
    fprintf(out, "    \"peak_network_cars\": %d,\n", peak_network_cars);
    fprintf(out, "    \"peak_congestion_street\": \"%s\",\n", peak_congestion_street);
    fprintf(out, "    \"peak_congestion_pct\": %.2f,\n", peak_congestion_pct);
    fprintf(out, "    \"final_total_cars\": %d\n", total_network_cars(streets));
    fprintf(out, "  }\n");
    fprintf(out, "}\n");

    free_all_queues(streets);
}
