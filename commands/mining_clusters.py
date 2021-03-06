import sys
from typing import Tuple, List
from math import ceil, floor
from block_hardness_data import BLOCK_HARDNESS_ORES, BLOCK_HARDNESS_BLOCKS

NUMBER_OF_LINES = 13


def main():
    X: List[int] = []
    Y: List[int] = []
    output: List[str] = []

    # flag ore = 1: no ore, ore = 2: ore
    ore, block_hardness = parse_input_parameters()

    # set bounds according to ore-flag
    if (ore == 1):
        low = 300
        high = 3500
    else:
        low = 1500
        high = 47000

    # loop over different mining speeds
    for (i, x) in enumerate(range(low, high)):
        X.append(x)
        if (block_hardness * 30 * ore / x) < 1:
            if len(Y) < 1 or Y[i - 1] != 0:
                output.append(f"{str(x)}, instabreak")
            Y.append(0)
        else:
            if round(block_hardness * 30 / x) == 4:
                pass
            Y.append(max(4, round(block_hardness * 30 / x)))
            if Y[i - 1] > Y[i]:
                output.append(f"{str(x)}, {str(Y[i])}")

    generate_columns(output)


def generate_columns(data: List[str]):
    lines = ceil(len(data) / 4)

    for j in range(lines):
        line = []
        for i in range(4):
            if j + i * lines >= len(data):
                break
            line.append(data[j + i * lines])
        print('\t\t'.join(line))


def generate_smart_columns(data: List[str]):
    columns = ceil(len(data) / NUMBER_OF_LINES)      # have 13 lines at most, variable number of columns
    upper = ceil(len(data) / columns)

    if floor(5 / columns) < 1:      # if data size is too big don't try to do columns
        columns = 1
        upper = len(data)

    for i in range(upper):
        line = []
        for j in range(columns):
            if i + j * upper < len(data):
                line.append(data[i + j * upper])
        print((floor(5 / columns) * '\t').join(line))


def parse_input_parameters() -> Tuple[int, int]:
    if sys.argv[1].isdigit():
        print(f"**Ticks per Block with hardness {sys.argv[1]} (1 tick = 0.05s)**\n")
        return (1, int(sys.argv[1]))

    block_name = sys.argv[1].lower()
    if block_name in BLOCK_HARDNESS_BLOCKS:
        print(f"**Ticks per Block of {sys.argv[1]} (1 tick = 0.05s)**\n")
        return (1, BLOCK_HARDNESS_BLOCKS[block_name])
    elif block_name in BLOCK_HARDNESS_ORES:
        print(f"**Ticks per Block of {sys.argv[1]} (Ore)) (1 tick = 0.05s)**\n")
        return (2, BLOCK_HARDNESS_ORES[block_name])
    exit(6)


if __name__ == "__main__":
    main()
