
class Evilman:
    def __init__(self, name, power1, power2, power3):
        self.name = name              # Name of the Evilman
        self.power1 = power1            # Power 1 of the Evilman
        self.power2 = power2            # Power 2 of the Evilman
        self.power3 = power3            # Power 3 of the Evilman

    def counter_player(self, player):
        """
        Counter the actions of the player.
        """
        print(f"{self.name} uses {self.power1} to counter {player.name}.")