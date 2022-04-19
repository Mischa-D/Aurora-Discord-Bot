# Aurora-Discord-Bot
A Discord Bot for Skyblock.

Features:
* `/help` lists all commands
* `/greetings` replies with 'Hello World!'
* `/mining_times <block>` Lists how many ticks it takes to mine that block type with different mining speeds
* `/mining_profits <mining_speed> <mining_fortune> <pristine>` Calculates the amount of coins you would get from NPC selling jade with the given mining stats. At the moment you need to include gemstone specific stats that are not shown in your stats overview by hand (like the stats from professional, fortunate or the jungle amulet).


Feature-Queue:
* using Hypixel API to fetch a players maximum possible mining speed and changing the output of `/mining_times` and `/mining_profits` based on that
* completely rework mining_times
* include blue cheese goblin omelette and hotm perks automatically into calulations
* make `/mining_profits` be usable with other blocks than jade and with bazaar selling prizes
* new commands
