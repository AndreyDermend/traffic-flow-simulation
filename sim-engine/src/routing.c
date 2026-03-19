#include "routing.h"

int choose_destination_index(int street_index, double rand_percent) {
    switch (street_index) {
        case 0:  // Lasalle 1
            if (rand_percent < 0.30) return 3;
            if (rand_percent < 0.60) return 5;
            return -1;
        case 1:  // Lasalle 2
            return rand_percent < 0.60 ? 7 : -1;
        case 2:  // Dale 3
            return rand_percent < 0.60 ? 5 : -1;
        case 3:  // Farmington 1
            if (rand_percent < 0.20) return 9;
            if (rand_percent < 0.60) return 10;
            return -1;
        case 4:  // Farmington 2
            if (rand_percent < 0.33) return -1;
            if (rand_percent < 0.66) return 1;
            return 2;
        case 5:  // Brace 1
            return rand_percent < 0.40 ? -1 : 11;
        case 6:  // Brace 2
            return -1;
        case 7:  // Memorial 3
            return rand_percent < 0.40 ? -1 : 8;
        case 8:  // S Main 1
            if (rand_percent < 0.20) return -1;
            if (rand_percent < 0.60) return 4;
            return 10;
        case 9:  // S Main 2
            return -1;
        case 10: // N Main 1
            return rand_percent < 0.30 ? -1 : 6;
        case 11: // N Main 2
            if (rand_percent < 0.20) return -1;
            if (rand_percent < 0.60) return 4;
            return 9;
        default:
            return -1;
    }
}
