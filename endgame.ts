class Player {
    name: string;
    position: [number, number];
    health: number;
    alive: boolean;

    constructor(name: string, position: [number, number] = [0, 0], health: number = 100) {
        this.name = name;
        this.position = position;
        this.health = health;
        this.alive = true;
    }

    moveTo(newPosition: [number, number]): void {
        this.position = newPosition;
        console.log(`${this.name} moved to position ${this.position}`);
    }

    takeDamage(damage: number): void {
        this.health -= damage;
        console.log(`${this.name} takes ${damage} damage. Health: ${this.health}`);

        if (this.health <= 0) {
            this.alive = false;
            console.log(`${this.name} has died!`);
        }
    }
}

class Game {
    player: Player;
    jobPosition: [number, number];
    timeLimit: number; // In seconds
    startTime: number;

    constructor(player: Player, jobPosition: [number, number], timeLimit: number) {
        this.player = player;
        this.jobPosition = jobPosition;
        this.timeLimit = timeLimit;
        this.startTime = Date.now();
    }

    checkVictory(): boolean {
        if (this.player.position[0] === this.jobPosition[0] && this.player.position[1] === this.jobPosition[1]) {
            console.log("Victory! You have reached your job!");
            return true;
        }
        return false;
    }

    checkDefeat(): boolean {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 1000; // Convert to seconds

        if (!this.player.alive) {
            console.log("Game Over! You died from a trap.");
            return true;
        }

        if (elapsedTime > this.timeLimit) {
            console.log("Game Over! Time limit exceeded.");
            return true;
        }

        return false;
    }

    async runGame(): Promise<void> {
        while (true) {
            if (this.checkVictory()) {
                break;
            }

            if (this.checkDefeat()) {
                break;
            }

            // Simulate game actions (moving, traps, etc.)
            await this.delay(1000); // Simulate 1 second passing (you can modify this logic)
            // Here, you could add more game logic like traps, obstacles, etc.
        }
    }

    delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Example usage
const main = async () => {
    // Create a player
    const player = new Player("Martin");

    // Define the position of the job (the goal)
    const jobPosition: [number, number] = [10, 10];

    // Define a time limit (e.g., 60 seconds to reach the goal)
    const timeLimit = 60;

    // Create a game instance
    const game = new Game(player, jobPosition, timeLimit);

    // Move player to simulate gameplay (you can replace this with your game logic)
    player.moveTo([5, 5]);  // Move to an intermediate position
    player.takeDamage(30);  // Simulate trap damage

    await game.delay(2000);  // Simulate 2 seconds passing

    player.moveTo([10, 10]);  // Move to the job (goal)

    // Run the game loop
    await game.runGame();
};

main();
