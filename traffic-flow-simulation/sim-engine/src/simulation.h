#ifndef SIMULATION_H
#define SIMULATION_H

#include <stdio.h>

#define NUM_STREETS 12
#define ENGINE_TICKS 60

typedef struct CarNode {
    int car_id;
    struct CarNode *next;
} CarNode;

typedef struct Street {
    char name[32];
    int queue_capacity;
    int queue_count;
    CarNode *queue_front;
    CarNode *queue_rear;
    double greenlight_time;
    double redlight_time;
    double timer;
    int is_green;
    int cars_per5min;
    double time_since_last_add;
    int stop_sign;
} Street;

void initialize_default_streets(Street streets[NUM_STREETS], double time_ratio, int *next_car_id);
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
);
void update_light(Street *street);
void add_cars_from_data_cycle(Street *street, double data_cycle, int *next_car_id);
int move_car(Street *current_street, int street_index, Street streets[NUM_STREETS]);
void run_simulation_json(FILE *out, int represented_seconds, unsigned int seed);
void free_all_queues(Street streets[NUM_STREETS]);

#endif
