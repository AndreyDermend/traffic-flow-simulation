#include "simulation.h"

#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    int represented_seconds = 300;
    unsigned int seed = 42;

    if (argc >= 2) {
        represented_seconds = atoi(argv[1]);
        if (represented_seconds <= 0) {
            fprintf(stderr, "represented_seconds must be a positive integer.\n");
            return EXIT_FAILURE;
        }
    }

    if (argc >= 3) {
        seed = (unsigned int)strtoul(argv[2], NULL, 10);
    }

    run_simulation_json(stdout, represented_seconds, seed);
    return EXIT_SUCCESS;
}
