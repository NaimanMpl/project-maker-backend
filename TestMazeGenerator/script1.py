import random
import json

def generate_maze(width, height):
    maze = [['1'] * (width * 2 + 1) for _ in range(height * 2 + 1)]

    def add_walls(x, y):
        directions = [(2, 0), (0, 2), (-2, 0), (0, -2)]
        random.shuffle(directions)

        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 < nx < width * 2 and 0 < ny < height * 2 and maze[ny][nx] == '1':
                maze[y + dy // 2][x + dx // 2] = '0'
                maze[ny][nx] = '0'
                add_walls(nx, ny)

    start_x = random.randint(0, width - 1) * 2 + 1
    start_y = random.randint(0, height - 1) * 2 + 1
    maze[start_y][start_x] = '0'

    add_walls(start_x, start_y)

    return maze

def add_extra_paths(maze):
    height = len(maze)
    width = len(maze[0])
    for _ in range((width // 2) * (height // 2) // 5):
        x = random.randint(1, width - 2)
        y = random.randint(1, height - 2)
        if maze[y][x] == '0':
            directions = [(0, 2), (2, 0), (0, -2), (-2, 0)]
            random.shuffle(directions)

            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                if 0 < nx < width and 0 < ny < height and maze[ny][nx] == '1':
                    maze[y + dy // 2][x + dx // 2] = '0'
                    maze[ny][nx] = '0'
                    break

def generate_json(maze, map_name):
    tiles = []
    height = len(maze)
    width = len(maze[0])
    added_positions = set()

    for y in range(height):
        for x in range(width):
            if maze[y][x] == '0':
                # Créer une route de 2 tuiles de large
                if x + 1 < width and maze[y][x + 1] == '0':
                    for dx in range(2):
                        position = (x + dx, y)
                        if position not in added_positions:
                            tiles.append({
                                "type": "Road",
                                "description": "Road tile",
                                "properties": {
                                    "position": {"x": x + dx, "y": y, "z": 0},
                                    "angle": 0
                                }
                            })
                            added_positions.add(position)

                    if y > 0:
                        for dx in range(2):
                            position = (x + dx, y - 1)
                            if position not in added_positions:
                                tiles.append({
                                    "type": "Sidewalk",
                                    "description": "Sidewalk tile",
                                    "properties": {
                                        "position": {"x": x + dx, "y": y - 1, "z": 0},
                                        "angle": 0
                                    }
                                })
                                added_positions.add(position)
                    if y < height - 1:
                        for dx in range(2):
                            position = (x + dx, y + 1)
                            if position not in added_positions:
                                tiles.append({
                                    "type": "Sidewalk",
                                    "description": "Sidewalk tile",
                                    "properties": {
                                        "position": {"x": x + dx, "y": y + 1, "z": 0},
                                        "angle": 0
                                    }
                                })
                                added_positions.add(position)

                    if random.random() < 0.5:
                        crosswalk_position = (x + 1, y)
                        if crosswalk_position not in added_positions:
                            tiles.append({
                                "type": "Crosswalk",
                                "description": "Crosswalk tile",
                                "properties": {
                                    "position": {"x": x + 1, "y": y, "z": 0},
                                    "angle": 0
                                }
                            })
                            added_positions.add(crosswalk_position)

    for y in range(height):
        for x in range(width):
            if maze[y][x] == '0' and y + 1 < height and maze[y + 1][x] == '0':
                crosswalk_position = (x, y + 1)
                if crosswalk_position not in added_positions:
                    tiles.append({
                        "type": "Crosswalk",
                        "description": "Crosswalk tile",
                        "properties": {
                            "position": {"x": x, "y": y + 1, "z": 0},
                            "angle": 90
                        }
                    })
                    added_positions.add(crosswalk_position)

    map_data = {
        "name": map_name,
        "type": "Map",
        "description": "Description of the map",
        "properties": {
            "size": {
                "Xmin": 0,
                "Xmax": width * 2,
                "Ymin": 0,
                "Ymax": height * 2
            },
            "tiles": tiles
        }
    }

    return json.dumps(map_data, indent=4)

def save_json_to_file(json_data):
    random_number = random.randint(100000, 999999)
    file_name = f"map{random_number}.json"
    with open(file_name, 'w') as f:
        f.write(json_data)
    print(f"Fichier enregistré sous : {file_name}")

width, height = 2, 2
maze = generate_maze(width, height)
add_extra_paths(maze)
map_name = "RandomMaze"
maze_json = generate_json(maze, map_name)

save_json_to_file(maze_json)
