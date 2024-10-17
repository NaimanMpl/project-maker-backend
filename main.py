from protector import Protector
from player import Player
from evilman import Evilman

# Creating the objects
protector = Protector(name="Guardian", power1="Speed++ !", power2="Stop the Evilman for 5 seconds !", power3="Invisibility !")
player = Player(name="Alex", objective="Find a job")
evilman = Evilman(name="Dark Lord", power1="Stop the player !", power2="Slow Motion !", power3="Make an obstacle appear !")

# Using the methods
protector.help_player(player)
protector.counter_evilman(evilman)

player.move_forward()
player.dash()