import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {

    @ViewChild("screen", { static: false })
    canvas!: ElementRef;

    ngAfterViewInit() {

        let ctx = this.canvas.nativeElement.getContext('2d');

        let gameOver: boolean = false;

        let player = { x: 20, y: 20 }
        let xVelocity: number = 0;
        let yVelocity: number = 0;

        function checkGameOver() {

        };

        function movePlayer() {
            player.x += xVelocity,
            player.y += yVelocity
        }

        function drawPlayer() {
            ctx.fillStyle = 'black';
            ctx.fillRect(player.x, player.y, 20, 20);
        };

        function changeDirection(event: any) {
            const keyPressed = event.keyCode;

            const LEFT = 37;
            const UP = 38;
            const RIGHT = 39;
            const DOWN = 40;

            if (keyPressed == LEFT) {
                xVelocity = -20;
                yVelocity = 0;
                movePlayer();
            }
            else if (keyPressed == UP) {
                xVelocity = 0;
                yVelocity = -20;
                movePlayer();
            }
            else if (keyPressed == RIGHT) {
                xVelocity = 20;
                yVelocity = 0;
                movePlayer();
            }
            else if (keyPressed == DOWN) {
                xVelocity = 0;
                yVelocity = 20;
                movePlayer();
            }
        };
        let id = setInterval(() => {
            if (!gameOver) {
                window.addEventListener("keydown", changeDirection);
                checkGameOver();
                ctx.fillStyle = 'lightgray';
                ctx.fillRect(0, 0, 400, 400);
                drawPlayer();
            }
            else {
                var answer = confirm("Game Over!")
                if (answer) location.reload();
                clearInterval(id)
            }
        }, 1);
    }
}