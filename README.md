# Aurora-Discord-Bot
A Discord Bot for Skyblock.

## Features:
* `/help`

  lists all commands
  
* `/greetings`

  replies with 'Hello World!'

* `/hotm [name] [profile]`

  prints out a list with all active hotm perks and their level, as well as the players mining stats


* `/mining_times <block>`

  Lists how many ticks it takes to mine that block type with different mining speeds
 
* `mining_profits <mode>`

  Calculates the amount of coins you would get from selling jade/`block` to the most profitable sell option.

  * `manual`:
  
    `<mining_speed> <mining_fortune> <pristine> [blue_cheese] [block]` Uses the given mining stats (remember to include hidden stats, i.e. mining speed from professional).
  
  * `profile`:
  
    `[name] [profile] [bal] [blue_cheese] [block]` Uses the given profiles fetched best possible mining stats.

It will use a bal pet if `bal` is set to true, else it     will look for the best scatha pet. If `blue_cheese` is enabled it will use mining speed boost Lvl. 3 instead of Lvl. 2 in the calculations
    
    
## Feature-Queue:
* changing the output of `mining_times` based on fetched mining speed
* new commands
