#include "streets.h"

const char *control_type_for_street(const Street *street) {
    return street->stop_sign ? "stop_sign" : "signal";
}
