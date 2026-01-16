# 🤖 Neon Slime Arena – AI Opponent Overview

This document explains how the AI opponent works in `Neon Slime Arena` (see `src/SlimeSoccer.js`, the `updateAI` function).

## 1. Which slime is the AI?

- In **single-player** mode, the **left slime (cyan)** is controlled by the AI.
- The **right slime (red)** is the human player (keyboard or touch controls).
- In **multiplayer** mode the AI is disabled – both slimes are controlled by humans.

## 2. Difficulty levels

The AI uses a configuration object called `difficultySettings`:

- **Easy**
  - `speed`: 0.5 (50% of base slime speed)
  - `reaction`: 30 frames between decisions (slow reactions)
  - `accuracy`: 0.4 (rough targeting)
  - `aggression`: 0.2 (mostly defensive)
  - `jumpChance`: 0.3 (low chance to jump for the ball)
  - `grabDistance`: 80px

- **Medium**
  - `speed`: 0.8
  - `reaction`: 15 frames
  - `accuracy`: 0.7
  - `aggression`: 0.6
  - `jumpChance`: 0.6
  - `grabDistance`: 60px

- **Hard**
  - `speed`: 1.2 (faster than a normal slime)
  - `reaction`: 5 frames (very quick)
  - `accuracy`: 0.95 (precise targeting)
  - `aggression`: 1.0 (very offensive)
  - `jumpChance`: 0.9
  - `grabDistance`: 40px (must be closer, but reacts better)

These settings control how often the AI thinks, how fast it moves, how precisely it positions itself, and how aggressively it jumps/grabs the ball.

## 3. Decision loop

Each physics frame, if `playerMode === 'single'`, the game calls `updateAI()`:

1. **Cooldown check**
   - The AI only makes a new “big decision” when `decisionCooldown` reaches 0.
   - While cooling down, it simply moves toward its current `targetX` using its `speed`.

2. **Stable start**
   - For the first few seconds (`timeLeft > 55`), the AI stays near a safe starting position
     (`x ≈ 200`) to avoid chaotic opening moves.
   - If the ball comes close or the early period ends, it leaves this stable state and starts
     playing normally.

3. **Choose behavior based on ball position and velocity**

   The AI reads:
   - Ball position (`ball.x`, `ball.y`)
   - Ball velocity (`ball.vx`)
   - Its own position (`ai.x`, `ai.y`)

   Then chooses between three modes:

   - **Offensive** (chase the ball and attack)
     - Triggered when the ball is on the AI’s attacking side and not moving strongly against it.
     - Sets `newTargetX` slightly **behind** the ball (offset depends on `accuracy`).
     - If close enough and the ball is low, it may **grab** the ball.
     - If the ball is at a good height and distance, it may **jump** to hit it, with a chance based on `jumpChance`.
     - On **Hard**, it also **predicts** the ball’s future position by adding `ball.vx * 10` to `ball.x`.

   - **Defensive** (protect own goal)
     - Triggered when the ball is coming toward the AI’s goal or on the defensive side.
     - Positions itself between the ball and its own goal (`SLIME_RADIUS + 10` minimum).
     - Jumps more often if the ball is near and high enough.
     - On **Hard**, if the ball is very close to the goal and moving fast, it moves deep into goal
       and jumps as an emergency save.

   - **Midfield positioning**
     - Used when the situation is neutral (ball near center, not clearly attacking/defending).
     - Stays around a midfield position influenced by `aggression`.
     - On **Hard**, it reads the opponent slime velocity and shifts slightly to anticipate moves.

4. **Apply movement and actions**

   - If the new target position is significantly different, the AI updates `targetX` and resets
     `decisionCooldown` based on `reaction`.
   - It computes the horizontal difference between `targetX` and its current `x` and sets `vx`
     toward that target, scaled by `speed` and distance.
   - If it decided to jump and is on the ground, it sets `vy` to a jump value (tuned per difficulty).
   - If it decided to grab and is close enough, the grab logic in `updatePhysics` takes over and
     attaches the ball to the slime.

## 4. Grab and shot behavior

Once the AI grabs the ball, a separate section of the physics code manages the “swing”:

- The ball is attached at a fixed distance from the slime and rotated using an angle `grabAngle` and angular velocity.
- When the AI releases grab, the ball:
  - Inherits some of the slime’s `vx` and `vy`.
  - Gets an extra push based on how fast the ball was swinging (angular velocity).
  - This can create curved or powerful shots, especially on higher difficulties.

## 5. Summary

- The AI is **stateful** (cooldown, stable start, targetX).
- Difficulty levels change **speed**, **reaction time**, **accuracy**, **aggression**, and **jump/grab behavior**.
- The AI switches between **offense**, **defense**, and **midfield** based on ball position and movement.
- Hard mode adds **prediction** and **emergency defense** to feel smarter and more challenging.

This design keeps the AI fun to play against while remaining understandable and deterministic enough to tweak. 
If you want to adjust behavior, the main place to start is the `difficultySettings` object and the conditional logic inside `updateAI` in `src/SlimeSoccer.js`.


