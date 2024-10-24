import os
import random
import json
import argparse

# INFO: This script generates a random maze and saves it as 2 format of a JSON of tiles.
# complexity of the maze generation is O(X^2) with X the width of the maze
# The maze is generated using a recursive backtracking algorithm
# The maze is then upscaled
# Roads(0) are added at the center of the maze (size 2x? or ?x2)
# Walls(1) are added around the roads (size 1x1)
# Sidewalks(2) are added around the roads (size 1x1)
# Crosswalks(3) are added at random locations (size 1x2 or 2x1)
# Houses(4) are added at random locations (size 2x2)
# Trees(5) are added at random locations (size 1x2)
# Lakes(6) are added at random locations (size 2x2)
# Start(7) and End(8) points are added at random locations (size 1x1)
# End(8) point is the farthest point from the Start(7) point. (size 1x1)

# The maze is saved as a JSON file with the following format:
# {
#     "name": "RandomMaze",
#     "type": "Map",
#     "description": "Description of the map",
#     "properties": {
#         "size": {
#             "Xmin": 0,
#             "Xmax": 100,
#             "Ymin": 0,
#             "Ymax": 100
#         },
#         "tiles": [
#             {
#                 "type": "Road",
#                 "description": "Road tile",
#                 "properties": {
#                     "position": {
#                         "x": 0,
#                         "y": 0,
#                         "z": 0
#                     },
#                     "angle": 0
#                 }
#             },
#             {
#                 "type": "Sidewalk",
#                 [...]
#          },
#          [...]
#     }
# }

# the maze is generated with a args.ratio based on the width
# default width is 12 (so the height is 5 and number of try to put crosswalks is 20*width)

argparse = argparse.ArgumentParser()
argparse.add_argument("--width", type=int, default=12, help="Width of the maze")
argparse.add_argument("--Name", type=str, default="RandomMaze", help="Name of the maze")
argparse.add_argument(
    "--crosswalks", type=int, default=20, help="A ratio for number crosswalks"
)
argparse.add_argument(
    "--decorations", type=int, default=500, help="Number of decorations"
)
argparse.add_argument("--ratio", type=int, default=16 / 9, help="Ratio of the maze")
args = argparse.parse_args()
width = args.width
height = int(width / args.ratio)

map_name = args.Name

num_crosswalks = args.crosswalks * width
decorations = 500 * width

def generate_maze(width, height):
    maze = [["1"] * (width * 2 + 1) for _ in range(height * 2 + 1)]

    def add_walls(x, y):
        directions = [(2, 0), (0, 2), (-2, 0), (0, -2)]
        random.shuffle(directions)

        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 < nx < width * 2 and 0 < ny < height * 2 and maze[ny][nx] == "1":
                maze[y + dy // 2][x + dx // 2] = "0"
                maze[ny][nx] = "0"
                add_walls(nx, ny)

    start_x = random.randint(0, width - 1) * 2 + 1
    start_y = random.randint(0, height - 1) * 2 + 1
    maze[start_y][start_x] = "0"

    add_walls(start_x, start_y)

    return maze


def add_extra_paths(maze):
    height = len(maze)
    width = len(maze[0])
    for _ in range((width // 2) * (height // 2) // 2):
        x = random.randint(1, width - 2)
        y = random.randint(1, height - 2)
        if maze[y][x] == "0":
            directions = [(0, 2), (2, 0), (0, -2), (-2, 0)]
            random.shuffle(directions)

            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                if 0 < nx < width and 0 < ny < height and maze[ny][nx] == "1":
                    maze[y + dy // 2][x + dx // 2] = "0"
                    maze[ny][nx] = "0"
                    break


def upscale_maze(original_maze):
    original_rows = len(original_maze)
    original_cols = len(original_maze[0])

    # The new dimensions: add space for sidewalks
    new_rows = original_rows * 3 + 2
    new_cols = original_cols * 3 + 2

    # Create the new maze filled with '1's (walls)
    new_maze = [["1" for _ in range(new_cols)] for _ in range(new_rows)]

    for i in range(original_rows):
        for j in range(original_cols):
            if original_maze[i][j] == "0":
                # Place a 3x3 block of '0's for roads
                new_maze[i * 3 + 1][j * 3 + 1] = "0"
                new_maze[i * 3 + 1][j * 3 + 2] = "0"
                new_maze[i * 3 + 2][j * 3 + 1] = "0"
                new_maze[i * 3 + 2][j * 3 + 2] = "0"

                # Handle connections with neighbors
                if (
                    j < original_cols - 1 and original_maze[i][j + 1] == "0"
                ):  # Right neighbor
                    new_maze[i * 3 + 1][j * 3 + 3] = "0"  # Connect to the right
                    new_maze[i * 3 + 2][j * 3 + 3] = "0"
                if (
                    i < original_rows - 1 and original_maze[i + 1][j] == "0"
                ):  # Bottom neighbor
                    new_maze[i * 3 + 3][j * 3 + 1] = "0"  # Connect below
                    new_maze[i * 3 + 3][j * 3 + 2] = "0"

    return new_maze


def add_sidewalks(maze):
    for i in range(len(maze)):
        for j in range(len(maze[0])):
            #  Add sidewalks around the roads but not ON the roads
            if maze[i][j] == "0":
                if maze[i - 1][j] == "1":
                    maze[i - 1][j] = "2"
                if maze[i + 1][j] == "1":
                    maze[i + 1][j] = "2"
                if maze[i][j - 1] == "1":
                    maze[i][j - 1] = "2"
                if maze[i][j + 1] == "1":
                    maze[i][j + 1] = "2"
                # Add sidewalks at the corners too
                if maze[i - 1][j - 1] == "1":
                    maze[i - 1][j - 1] = "2"
                if maze[i - 1][j + 1] == "1":
                    maze[i - 1][j + 1] = "2"
                if maze[i + 1][j - 1] == "1":
                    maze[i + 1][j - 1] = "2"
                if maze[i + 1][j + 1] == "1":
                    maze[i + 1][j + 1] = "2"
    for i in range(len(maze)):
        for j in range(len(maze[0])):
            # remove tile of sidewalk that are alone in the middle of the maze
            if maze[i][j] == "2":
                if (
                    (maze[i - 1][j] == "0")
                    and (maze[i + 1][j] == "0")
                    and (maze[i][j - 1] == "0")
                    and (maze[i][j + 1] == "0")
                ):
                    maze[i][j] = "0"
    return maze


def add_random_crosswalks(maze, num_crosswalks):
    for _ in range(num_crosswalks):
        x = random.randint(1, len(maze[0]) - 2)
        y = random.randint(1, len(maze) - 2)
        # find a random spot for the crosswalk matching patern 1x4 or 4x1
        if (
            maze[y][x] == "2"
            and maze[y][x + 1] == "0"
            and maze[y][x + 2] == "0"
            and maze[y][x + 3] == "2"
            and maze[y + 1][x + 1] == "0"
            and maze[y + 1][x + 2] == "0"
            and maze[y + 1][x + 3] == "2"
            and maze[y - 1][x + 1] == "0"
            and maze[y - 1][x + 2] == "0"
            and maze[y - 1][x + 3] == "2"
        ):
            maze[y][x + 1] = "3"
            maze[y][x + 2] = "3"
        elif (
            maze[y][x] == "2"
            and maze[y + 1][x] == "0"
            and maze[y + 2][x] == "0"
            and maze[y + 3][x] == "2"
            and maze[y + 1][x + 1] == "0"
            and maze[y + 2][x + 1] == "0"
            and maze[y + 3][x + 1] == "2"
            and maze[y + 1][x - 1] == "0"
            and maze[y + 2][x - 1] == "0"
            and maze[y + 3][x - 1] == "2"
        ):
            maze[y + 1][x] = "3"
            maze[y + 2][x] = "3"
    return maze


def check_if_neighboor_is_crosswalk_or_sidewalk(maze, x, y):
    if (
        maze[y - 1][x] == "3"
        or maze[y - 1][x] == "2"
        or maze[y + 1][x] == "3"
        or maze[y + 1][x] == "2"
        or maze[y][x - 1] == "3"
        or maze[y][x - 1] == "2"
        or maze[y][x + 1] == "3"
        or maze[y][x + 1] == "2"
    ):
        return True
    return False


def check_if_it_is_a_walkable_tile(maze, x, y):
    if maze[y][x] == "2" or maze[y][x] == "3":
        return True
    return False


def add_start_end(maze):
    # collect all the possible start and end points (sidewalks)
    # Set the start point
    # collect all the tiles that are connected to the start point
    # Set the end point at the tile that is the farthest from the start point
    start = None
    while not start:
        x = random.randint(1, len(maze[0]) - 2)
        y = random.randint(1, len(maze) - 2)
        if maze[y][x] == "2":
            start = (y, x)
            maze[y][x] = "7"

    connected_tiles = []
    connected_tiles.append(start)
    new = True
    while new:
        for tile in connected_tiles:
            x = tile[1]
            y = tile[0]
            new = False
            if (
                check_if_it_is_a_walkable_tile(maze, x, y - 1)
                and not (y - 1, x) in connected_tiles
            ):
                connected_tiles.append((y - 1, x))
                new = True
            if (
                check_if_it_is_a_walkable_tile(maze, x, y + 1)
                and not (y + 1, x) in connected_tiles
            ):
                connected_tiles.append((y + 1, x))
                new = True
            if (
                check_if_it_is_a_walkable_tile(maze, x - 1, y)
                and not (y, x - 1) in connected_tiles
            ):
                connected_tiles.append((y, x - 1))
                new = True
            if (
                check_if_it_is_a_walkable_tile(maze, x + 1, y)
                and not (y, x + 1) in connected_tiles
            ):
                connected_tiles.append((y, x + 1))
                new = True
    # i need to find the farthest tile from the start point doing each vector with connected points
    biggest_distance = 0
    for tile in connected_tiles:
        distance = abs(tile[0] - start[0]) + abs(tile[1] - start[1])
        if distance > biggest_distance:
            biggest_distance = distance
            end = tile

    maze[start[0]][start[1]] = "7"
    maze[end[0]][end[1]] = "8"
    return maze


def add_random_decorations(maze, decorations):
    for _ in range(decorations):
        x = random.randint(1, len(maze[0]) - 2)
        y = random.randint(1, len(maze) - 2)
        # i want to select the type randomly between house and tree (and more if i add more decorations)
        # i want to set differentprobabilities for each type
        proba = random.randint(1, 100)
        if proba < 70:
            type = 4
        elif proba < 95:
            type = 5
        else:
            type = 6
        decorations_types = ["4", "5", "6"]
        # if maze[y][x] == '1' and maze[y][x + 1] == '1' and maze[y + 1][x] == '1' and maze[y + 1][x + 1] == '1' and maze[y][x - 1] == '1' and maze[y - 1][x] == '1' and maze[y - 1][x - 1] == '1' and maze[y - 1][x + 1] == '1' and maze[y + 1][x - 1] == '1':
        # finally i don't need to check if it's a 1 around. just if there is no decoration already
        if maze[y][x] == "1":
            # i need to check if the 2x2 block is empty
            if (
                maze[y][x + 1] == "1"
                and maze[y + 1][x] == "1"
                and maze[y + 1][x + 1] == "1"
            ):
                # i need to check if i'm not too close to another decoration
                if (
                    maze[y - 1][x] not in decorations_types
                    and maze[y + 1][x] not in decorations_types
                    and maze[y][x - 1] not in decorations_types
                    and maze[y][x + 1] not in decorations_types
                    and maze[y - 1][x - 1] not in decorations_types
                    and maze[y - 1][x + 1] not in decorations_types
                    and maze[y + 1][x - 1] not in decorations_types
                    and maze[y + 1][x + 1] not in decorations_types
                ):
                    maze[y][x] = str(type)
    return maze

def check_angle_sidewalk(maze, i, j):
    angle = 1
    if maze[i - 1][j] == "0":
        angle = 180
        if maze[i][j - 1] == "0":
            angle = 225
        elif maze[i][j + 1] == "0":
            angle = 135
    elif maze[i][j + 1] == "0":
        angle = 90
        if maze[i - 1][j] == "0":
            angle = 135
        elif maze[i + 1][j] == "0":
            angle = 45
    elif maze[i + 1][j] == "0":
        angle = 0
        if maze[i][j + 1] == "0":
            angle = 45
        elif maze[i][j - 1] == "0":
            angle = 315
    elif maze[i][j - 1] == "0":
        angle = 270
        if maze[i + 1][j] == "0":
            angle = 315
        elif maze[i - 1][j] == "0":
            angle = 225
    #  here i add corners sidewalks
    if maze[i - 1][j] == "3" and maze[i][j - 1] == "3":
        angle = 225
    elif maze[i - 1][j] == "3" and maze[i][j + 1] == "3":
        angle = 315
    elif maze[i + 1][j] == "3" and maze[i][j - 1] == "3":
        angle = 135
    elif maze[i + 1][j] == "3" and maze[i][j + 1] == "3":
        angle = 45
    return angle

def generate_json(maze, map_name):
    tiles = []
    for i in range(len(maze)):
        for j in range(len(maze[0])):
            if maze[i][j] == "0":
                tiles.append(
                    {
                        "type": "Road",
                        "description": "Road tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": 0,
                        },
                    }
                )
            elif maze[i][j] == "2":
                angle = check_angle_sidewalk(maze, i, j)
                tiles.append(
                    {
                        "type": "Sidewalk",
                        "description": "Sidewalk tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": angle,
                        },
                    }
                )
            elif maze[i][j] == "3":
                angle = 1
                if maze[i - 1][j] == "2" or maze[i + 1][j] == "2":
                    angle = 0
                elif maze[i][j + 1] == "2" or maze[i][j - 1] == "2":
                    angle = 90

                tiles.append(
                    {
                        "type": "Crosswalk",
                        "description": "Crosswalk tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": angle,
                        },
                    }
                )
            elif maze[i][j] == "4":
                tiles.append(
                    {
                        "type": "House",
                        "description": "House tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": 0,
                        },
                    }
                )
            elif maze[i][j] == "5":
                tiles.append(
                    {
                        "type": "Tree",
                        "description": "Tree tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": 0,
                        },
                    }
                )
            elif maze[i][j] == "6":
                tiles.append(
                    {
                        "type": "Lake",
                        "description": "Lake tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": 0,
                        },
                    }
                )
            elif maze[i][j] == "7":
                angle = check_angle_sidewalk(maze, i, j)
                tiles.append(
                    {
                        "type": "Sidewalk",
                        "description": "Sidewalk tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": angle,
                        },
                    }
                )
                tiles.append(
                    {
                        "type": "Start",
                        "description": "Start tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": 0,
                        },
                    }
                )
            elif maze[i][j] == "8":
                angle = check_angle_sidewalk(maze, i, j)
                tiles.append(
                    {
                        "type": "Sidewalk",
                        "description": "Sidewalk tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": angle,
                        },
                    }
                )
                tiles.append(
                    {
                        "type": "End",
                        "description": "End tile",
                        "properties": {
                            "position": {"x": j, "y": i, "z": 0},
                            "angle": 0,
                        },
                    }
                )

    map_data = {
        "name": map_name,
        "type": "Map",
        "description": "Description of the map",
        "properties": {
            "size": {"Xmin": 0, "Xmax": len(maze[0]), "Ymin": 0, "Ymax": len(maze)},
            "tiles": tiles,
        },
    }

    return json.dumps(map_data, indent=4)


def save_json_to_file(json_data, name):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_name = os.path.join(script_dir, f"{name}.json")
    with open(file_name, "w") as f:
        f.write(json_data)


def main():
    maze = generate_maze(width, height)
    add_extra_paths(maze)

    maze = upscale_maze(maze)
    maze = add_sidewalks(maze)
    maze = add_random_crosswalks(maze, num_crosswalks)
    maze = add_start_end(maze)
    maze = add_random_decorations(maze, decorations)
    maze_json = generate_json(maze, map_name)
    # in the maze array there is a lot of strings, i need to convert them to int
    maze_str_to_int = []
    for row in maze:
        row_int = []
        for cell in row:
            row_int.append(int(cell))
        maze_str_to_int.append(row_int)

    maze = maze_str_to_int
    save_json_to_file(json.dumps({"map": maze}), "mazeArray")
    save_json_to_file(maze_json, "map")

    unity_map = json.loads(maze_json)

    tiles = unity_map["properties"]["tiles"]
    start = None
    end = None

    for tile in tiles:
        if tile["type"] == "Start":
            start = tile
        if tile["type"] == "End":
            end = tile

    print(json.dumps({"map": maze, "start": start, "end": end}))


if __name__ == "__main__":
    main()
