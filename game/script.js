window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;

    // 🎮 Input Handler
    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if (
                    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
                    this.game.keys.indexOf(e.key) === -1
                ){
                    this.game.keys.push(e.key);
                } else if (e.key === ' '){
                    this.game.player.shootTop();
                }
            });
            window.addEventListener('keyup', e =>{
                const index = this.game.keys.indexOf(e.key);
                if (index > -1) this.game.keys.splice(index, 1);
            });
        }
    }

    // 💥 Projectile
    class Projectile {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 7;
            this.markedForDeletion = false;
        }
        update(){
            this.x += this.speed;
            if (this.x > this.game.width * 1.1) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // 🧍‍♂ Player
    class Player {
        constructor(game){
            this.game = game;
            this.width = 100;
            this.height = 100;
            this.x = 50;
            this.y = canvas.height / 2 - this.height / 2;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 4;
            this.projectiles = [];
        }

        update(){
            // movement
            if (this.game.keys.includes('ArrowRight')) this.speedX = this.maxSpeed;
            else if (this.game.keys.includes('ArrowLeft')) this.speedX = -this.maxSpeed;
            else this.speedX = 0;

            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;

            this.x += this.speedX;
            this.y += this.speedY;

            // stay inside canvas
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > this.game.height) this.y = this.game.height - this.height;
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;

            // projectiles
            this.projectiles.forEach(p => p.update());
            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        }

        draw(context){
            context.fillStyle = 'limegreen';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(p => p.draw(context));
        }

        shootTop(){
            if (this.game.ammo > 0) {
                this.projectiles.push(
                    new Projectile(this.game, this.x + this.width, this.y + this.height / 2 - 2)
                );
                this.game.ammo--;
            }
        }
    }

    // 👾 Enemy Base Class
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
        }
        update(){
            this.x += this.speedX;
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);
        }
    }

    // 🐟 Specific Enemy Type
    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }

    // 💡 UI (Score + Ammo Bars + Game Over Message)
    class UI {
        constructor(game){
            this.game = game;
            this.color = 'white';
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
        }
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            // score
            context.fillText('Score: ' + this.game.score, 20, 40);
            // ammo bars
            for (let i = 0; i < this.game.ammo; i++){
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            // game over messages
            if (this.game.gameOver){
                context.textAlign = 'center';
                let message1, message2;
                if (this.game.score > this.game.winningScore){
                    message1 = 'You Win!';
                    message2 = 'Well done!';
                } else {
                    message1 = 'You Lose!';
                    message2 = 'Try again next time!';
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
            }
            context.restore();
        }
    }

    // 🌌 Game Controller
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.backgroundColor = 'darkblue';
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 10;
        }

        update(deltaTime){
            this.player.update();

            // reload ammo
            if (this.ammoTimer > this.ammoInterval){
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }

            // enemies
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                            this.score += enemy.score;
                            if (this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                });
            });

            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

            if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }

        draw(context){
            context.fillStyle = this.backgroundColor;
            context.fillRect(0, 0, this.width, this.height);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
        }

        addEnemy(){
            this.enemies.push(new Angler1(this));
        }

        checkCollision(rect1, rect2){
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            );
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);
});