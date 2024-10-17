class Protector:
    def __init__(self, name, power1, power2, power3):
        self.name = name                # Name of the protector
        self.power1 = power1            # Power 1 of the protector
        self.power2 = power2            # Power 2 of the protector
        self.power3 = power3            # Power 3 of the protector
    
    def help_player(self, player):
        """
        Help the player to reach his job.
        """
        print(f"{self.name} uses {self.power1} to help {player.name} reach his job.")
    
    def counter_evilman(self, evilman):
        """
        Counter the actions of Evilman to protect the player.
        """
        print(f"{self.name} uses {self.power2} to counter {evilman.name} and protect the player.")