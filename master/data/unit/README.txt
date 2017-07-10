README: unit data files

Each unit file will represent an array of units of the same type (either Lumberjacks or Beavers).


**Each unit needs:

state:
can be one of the following: attacking, following (a unit, in which case the destination is not
a pair of coordinates but instead, a certain unit -- see below), wood (getting wood - going to a tree), 
food (getting food - going to a berry bush)

coords:
current location (not necessarily a unit's destination - unit could be moving)

dest_coords:
null if unit is not moving, has no intention of moving at the time game state is persisted, or is intending
to attack (in which case the destination would be a certain unit from the opposing team - see next data)
otherwise, this is the fixed destinaiton of a unit on the map.

following:
if state is "following", this field must be the id of an enemy unit,
otherwise null


******************************
Big Questions:

*Can units follow other units?

*Will the entire map fit in the browser window?  Do we need to implement a camera
(eg: mouse hits the left edge of viewable map and camera shifts to the left)?
If the map is smaller, would that increase the frequency of attacks because of units being closer to each other 
and within the attack radius?

*Requirements:
"Data about the individual enemies and units must be loaded from separate files on the
web server (one enemy or unit per file)."
To fulfill this requirement, would it suffice to have one file to represent an array of units and
another file to represent an array of enemies?  In other words, there would be two types of moving
characters on the map, so one file per type, for a total of two files to represent all enemies and units.  Thanks!