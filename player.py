from enum import Enum

class PlayerStatus(Enum):
    NORMAL = "normal"
    STOPPED = "stopped"
    SLOW_MOTION = "in slow motion"
    INVISIBLE = "invisible"
    SPEED_BOOST = "speed++"
    BLOCKED = "blocked by an obstacle"


class Player:
    def __init__(self, name, objective):
        self.name = name                 # Name of the player
        self.objective = objective       # Player's objective (e.g., find a job)
        self.position = [0, 0]           # Player's position on the map (x, y)
        self.status = PlayerStatus.NORMAL # Default status is "normal"

    def move_left(self):
        """
        Move the player to the left (decreases the x-coordinate).
        """
        if self.status == PlayerStatus.BLOCKED:
            print(f"{self.name} is blocked and cannot move left.")
        if  self.status == PlayerStatus.STOPPED:
            print(f"{self.name} is stopped and cannot move left.")
        else:
            self.position[0] -= 1
            print(f"{self.name} moves left. New position: {self.position}")
    
    def move_right(self):
        """
        Move the player to the right (increases the x-coordinate).
        """
        if self.status == PlayerStatus.BLOCKED:
            print(f"{self.name} is blocked and cannot move right.")
        if  self.status == PlayerStatus.STOPPED:
            print(f"{self.name} is stopped and cannot move right.")
        else:
            self.position[0] += 1
            print(f"{self.name} moves right. New position: {self.position}")
    
    def move_forward(self):
        """
        Move the player forward (increases the y-coordinate).
        """
        if self.status == PlayerStatus.BLOCKED:
            print(f"{self.name} is blocked and cannot move forward.")
        if  self.status == PlayerStatus.STOPPED:
            print(f"{self.name} is stopped and cannot move forward.")
        else:
            self.position[1] += 1
            print(f"{self.name} moves forward. New position: {self.position}")
    
    def move_backward(self):
        """
        Move the player backward (decreases the y-coordinate).
        """
        if self.status == PlayerStatus.BLOCKED:
            print(f"{self.name} is blocked and cannot move backward.")
        if  self.status == PlayerStatus.STOPPED:
            print(f"{self.name} is stopped and cannot move backward.")
        else:
            self.position[1] -= 1
            print(f"{self.name} moves backward. New position: {self.position}")
    
    def jump(self):
        """
        Make the player jump.
        """
        if self.status == PlayerStatus.BLOCKED:
            print(f"{self.name} is blocked and cannot jump.")
        if  self.status == PlayerStatus.STOPPED:
            print(f"{self.name} is stopped and cannot jump.")
        else:
            print(f"{self.name} jumps!")
    
    def dash(self):
        """
        Make the player dash forward quickly by 2 units.
        """
        if self.status == PlayerStatus.BLOCKED:
            print(f"{self.name} is blocked and cannot dash.")
        if  self.status == PlayerStatus.STOPPED:
            print(f"{self.name} is stopped and cannot dash.")
        else:
            self.position[1] += 2
            print(f"{self.name} dashes forward. New position: {self.position}")
    
    def change_status(self, new_status):
        """
        Change the status of the player.
        """
        self.status = new_status
        print(f"{self.name} is now {self.status.value}.")


# Example usage in main.py would be similar to:
# player.move_left(), player.jump(), etc.