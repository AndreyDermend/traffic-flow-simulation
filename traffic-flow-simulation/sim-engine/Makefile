CC=gcc
CFLAGS=-Wall -Wextra -Werror -std=c11 -O2 -Isrc
SRC=src/main.c src/simulation.c src/streets.c src/routing.c
OUT=bin/traffic_sim

.PHONY: build clean

build:
	mkdir -p bin
	$(CC) $(CFLAGS) $(SRC) -lm -o $(OUT)

clean:
	rm -f $(OUT)
