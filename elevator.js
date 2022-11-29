{
    init: function(elevators, floors) {

        // var elevator = elevators[0]; // Let's use the first elevator
        var floors_requests = new Array(floors.length);
        floors.forEach(function(floor) {
            floors_requests[floor.floorNum()] = [0,0];
        });
          
      
        const isFullRatio = 0.8;
        let mapRequestsTimestamps = new Map();


        // elevator.on("idle", function() {
        //     // let's go to all the floors (or did we forget one?)
        //     elevator.goToFloor(0);
        //     elevator.goToFloor(1, true);

        //     elevator.stop();

        //     if(elevator.currentFloor() === 0) {// Do something special?
        //     }

        //     if(elevator.goingUpIndicator()) {
        //         elevator.goingDownIndicator(false);
        //     }
        //     if(elevator.goingDownIndicator()) {
        //         elevator.goingUpIndicator(false);
        //     }
        //     if(elevator.maxPassengerCount() > 5) {// Use this elevator for something special, because it's big
        //     }

        //     if(elevator.loadFactor() < 0.4) {
        //         // Maybe use this elevator, since it's not full yet?
        //     }
        //     elevator.destinationQueue = [];
        //     elevator.checkDestinationQueue();
        //     if(elevator.getPressedFloors().length > 0) {
        //         // Maybe go to some chosen floor first?
        //     }
        //     if(floor.floorNum() > 3) { }
        // });

        elevators.forEach(function(elevator) {
            elevator.dirToNum = function(direction) {
                if (direction == "up")
                    return 1;
                if (direction == "down")
                    return -1;
                return 0;
            };

            elevator.dirNum = function() {
                return elevator.dirToNum(elevator.destinationDirection());
            };

            elevator.realFloorNum = function() {
                return elevator.currentFloor() + (0.3 * elevator.dirNum());
            };
            elevator.floorNumToFloor = function(floorNum) {
                let curFloor;
                
                floors.forEach(function (floor) {
                    if ( floor.floorNum() === floorNum) {
                        curFloor = floor;
                    }
                })
                // console.log("floornumtofloor " + floorNum + " - " + curFloor); 
                return curFloor;
                // return floors[0];
            };
            elevator.elevatorToNum = function() {
                let curElevatorNum = 0;
                for (let e in elevators) {
                    if (elevators[e] === elevator) { curElevatorNum = e;}
                }
                return curElevatorNum;
            };
            elevator.dirNumToFloor = function(floorNum) {
                var curFloorNum = elevator.realFloorNum();
                return (floorNum > curFloorNum) ? 1 : (floorNum < curFloorNum) ? -1 : 0;
            };
            elevator.isFull = function() {
                return elevator.loadFactor() > isFullRatio;
            };
            elevator.status = function() {
                return elevator.dirNum();
            };
            elevator.removeDestination = function(floorNum) {
                var queueIndex = elevator.destinationQueue.indexOf(floorNum);
                if (queueIndex < 0)
                    return;
                elevator.destinationQueue.splice(queueIndex, 1);
                elevator.checkDestinationQueue();
            }
    
            elevator.currentDestination = function(defaultFloorNum) {
                return (elevator.destinationQueue.length > 0) ? elevator.destinationQueue[0] : defaultFloorNum;
            };
            elevator.distanceToFloor = function(floorNum) {
                // console.log("distance to floor " + floorNum + " - " + Math.abs(Math.abs(elevator.realFloorNum()) - Math.abs(floorNum)));
                return Math.abs(Math.abs(elevator.realFloorNum()) - Math.abs(floorNum));
            };
            elevator.updateIndicators = function() {

                let curFloor = elevator.floorNumToFloor(elevator.currentFloor());
                if (curFloor.isBottomFloor()) {
                    elevator.directionNumToIndicators(1);
                    // console.log("Bottom floor");
                }
                else if (curFloor.isTopFloor()) {
                    elevator.directionNumToIndicators(-1);
                }
                else if (elevator.destinationQueue.length === 0) {
                    elevator.directionNumToIndicators(0);
                }
                else if (elevator.indicatorsToDirectionNum() === 0 && elevator.destinationQueue.length > 0) {
                    if (elevator.isFloorNumAboveMe(elevator.destinationQueue[0]) ) { elevator.directionNumToIndicators(1);}
                    else {elevator.directionNumToIndicators(-1);}
                }
            };
            elevator.indicatorsToDirectionNum = function() {
                let result = 0;
                if (elevator.goingUpIndicator() === true && elevator.goingDownIndicator() === false ) { result = 1;}
                else if (elevator.goingUpIndicator() === false && elevator.goingDownIndicator() === true ) { result = -1;}
                return result;
            };
            elevator.directionNumToIndicators = function(directionNum) {
                switch (directionNum) {
                    case 1:
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                        break;
                    case -1 :
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(false);
                        break;
                    default :
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(true);
                        break;
                }
            };
            elevator.closestFloorWithCustomers = function() {
                let resultFloorNum = -1;
                let curClosestDistanceFloorNum = 999;
                floors.forEach(function (floor) {
                    // console.log("floor " + floor.floorNum() + " hasCustomersAndNoElevator " + floor.hasCustomersAndNoElevator());
                    if (floor.hasCustomersAndNoElevator()) {
                        if ( elevator.distanceToFloor(floor.floorNum()) < elevator.distanceToFloor(curClosestDistanceFloorNum) ) { curClosestDistanceFloorNum = floor.floorNum(); }                        
                    }
                })
                console.log("closest floor w/ customers - " + curClosestDistanceFloorNum);
                return (curClosestDistanceFloorNum === 999) ? 0 : curClosestDistanceFloorNum;
            };
            elevator.closestFloorFromArray = function(floorNums) {
                let resultFloorNum = -1;
                let curClosestDistanceFloorNum = 999;
                floors.forEach(function (floor) {
                    if (floorNums.includes(floor.floorNum())) {
                        if ( elevator.distanceToFloor(floor.floorNum()) < elevator.distanceToFloor(curClosestDistanceFloorNum) ) { curClosestDistanceFloorNum = floor.floorNum(); }                        
                    }
                })

                return (curClosestDistanceFloorNum === 999) ? 0 : curClosestDistanceFloorNum;
            };
            elevator.floorsAbove = function() {
                let floorsAboveArray = [];
                floors.forEach(function (floor) {                    
                    if (floor.floorNum() > elevator.currentFloor()) {
                        floorsAboveArray.push(floor.floorNum());
                    }
                })
                floorsAboveArray.sort(function(a, b){return a - b});
                return floorsAboveArray;
            };
            elevator.floorsBelow = function() {
                let floorsBelowArray = [];
                floors.forEach(function (floor) {                    
                    if (floor.floorNum() < elevator.currentFloor()) {
                        floorsBelowArray.push(floor.floorNum());
                    }
                })
                floorsBelowArray.sort(function(a, b){return b - a});

                return floorsBelowArray;
            };
            elevator.isFloorNumAboveMe = function(floorNum) {
                return elevator.floorsAbove().includes(floorNum);
            };
            elevator.isFloorNumBelowMe = function(floorNum) {
                return elevator.floorsBelow().includes(floorNum);
            };
            elevator.customersWantToGo = function(floorNum) {
                return elevator.getPressedFloors().indexOf(floorNum) != -1;
            };
            elevator.optimizeDestinationQueue = function() {
                if(elevator.destinationQueue.length > 0) {
                    let optimizedQueue = [];
                    if (elevator.destinationQueue.includes(elevator.currentFloor())) {optimizedQueue.push(elevator.currentFloor());}
                    switch (elevator.indicatorsToDirectionNum()) {
                        case 1: 
                            elevator.floorsAbove().forEach( function(fsAbove) {
                                if (elevator.destinationQueue.includes(fsAbove)) {optimizedQueue.push(fsAbove);}
                            })
                            elevator.floorsBelow().forEach( function(fsBelow) {
                                if (elevator.destinationQueue.includes(fsBelow)) {optimizedQueue.push(fsBelow);}
                            })
                            break;
                        case -1:
                            elevator.floorsBelow().forEach( function(fsBelow) {
                                if (elevator.destinationQueue.includes(fsBelow)) {optimizedQueue.push(fsBelow);}
                            })
                            elevator.floorsAbove().forEach( function(fsAbove) {
                                if (elevator.destinationQueue.includes(fsAbove)) {optimizedQueue.push(fsAbove);}
                            })
                            break;
                        default : optimizedQueue = elevator.destinationQueue;
                        
                    }
                    elevator.destinationQueue = optimizedQueue;
                    elevator.checkDestinationQueue();
                }
            };
            elevator.addPressedFloorsToQueue = function() {
                elevator.getPressedFloors().forEach( function(floorNum) {
                    if ( !elevator.destinationQueue.includes(floorNum)) {
                        elevator.goToFloor(floorNum);
                    }
                })
            };


            elevator.whatDo = function() {
                elevator.addPressedFloorsToQueue();
                elevator.updateIndicators();
                elevator.optimizeDestinationQueue();

                console.log("Destination Queue -> " + elevator.destinationQueue);
                return true;
            };
        });

        floors.forEach(function (floor) {
            floor.hasElevatorComing = function() {
                let result = false;
                elevators.forEach(function (elevator) {
                    if (elevator.destinationQueue.includes(floor.floorNum())) {result = true;}                    
                })
                return result;
            };
            floor.hasElevatorDefinitelyComing = function() {
                let result = false;
                elevators.forEach(function (elevator) {
                    if (elevator.getPressedFloors().includes(floor.floorNum())) {result = true;}                    
                })
                return result;
            };

            floor.hasElevatorSitting = function() {
                let result = false;
                elevators.forEach(function (elevator) {
                    if (elevator.currentFloor() === floor.floorNum() && elevator.status() === 0) {result = true;};
                })
                return result;
            };
            floor.hasElevatorSittingOrComing = function() {
                return (floor.hasElevatorComing() || floor.hasElevatorSitting());                
            };
            floor.hasCustomersUp = function() {
                var floor_requests = floors_requests[floor.floorNum()];
                return ( floor_requests[0] > 0);                
            };
            floor.hasCustomersDown = function() {
                // console.log(floor.floorNum() +"-"+ floors_requests[floor.floorNum(), 1]);
                var floor_requests = floors_requests[floor.floorNum()];
                return ( floor_requests[1] > 0);                
            };
            floor.hasCustomersDirection = function(direction) {
                var floor_requests = floors_requests[floor.floorNum()];
                if (direction == 1) {
                    return ( floor_requests[0] > 0);
                }
                if (direction == -1) {
                    return ( floor_requests[1] > 0);
                }
            };
            floor.hasCustomersAndNoElevator = function() {
                return ( !floor.hasElevatorSittingOrComing() && (floor.hasCustomersUp() || floor.hasCustomersDown() ));
            };
            floor.isTopFloor = function() {
                var result = true;
                floors.forEach(function (curFloor) {
                    if (curFloor.floorNum() > floor.floorNum()) { result = false;}
                    // console.log(curFloor.floorNum() + " " + floor.floorNum());
                })
                return result;
            };
            floor.isBottomFloor = function() {
                var result = true;
                floors.forEach(function (curFloor) {
                    if (curFloor.floorNum() < floor.floorNum()) { result = false;}
                })
                return result;
            };
            floor.setRequest = function( direction, setTo) {
                var directionArrayPos = 0;
                switch (direction) {
                    case 1: directionArrayPos = 0;
                    break;
                    case -1: directionArrayPos = 1;
                    break;
                    default: directionArrayPos = 0;
                }
                var floor_requests = floors_requests[floor.floorNum()];
                
                floor_requests[directionArrayPos] = setTo;
                floors_requests[floor.floorNum()] = floor_requests;

                let floorDirection =  { floorNum: floor.floorNum(), direction: 1 };
                mapRequestsTimestamps.set(floorDirection, Date.now());
            }; 
        });

        
        elevators.forEach(function (elevator) {            
            elevator.on("idle", function() {                
                // l
                console.log("Elevator - " + elevator.elevatorToNum() + " - idle - status - " + elevator.status()); 
                elevator.goToFloor(elevator.closestFloorWithCustomers());
                elevator.whatDo();
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                // l
                console.log("Elevator - " + elevator.elevatorToNum() + " - floor btn prsd " + floorNum + " - status - " + elevator.status());
                elevator.whatDo();
            });
            elevator.on("passing_floor", function(floorNum, direction) {                
                
                // do we stop or not
                let curFloor = elevator.floorNumToFloor(floorNum);
                console.log("Elevator - " + elevator.elevatorToNum() + " - passing floor " + floorNum + direction + " -hascust- " + curFloor.hasCustomersDirection(elevator.indicatorsToDirectionNum()));
                if ( curFloor.hasCustomersDirection(elevator.indicatorsToDirectionNum())) {
                    elevator.goToFloor(floorNum, true);
                }
                // elevator.whatDo();
            });
            elevator.on("stopped_at_floor", function(floorNum) {            
                // l
                console.log("Elevator - " + elevator.elevatorToNum() + " - stopped at floor " + floorNum + " - indics - " + elevator.indicatorsToDirectionNum());
                let curFloor = elevator.floorNumToFloor(floorNum);

                if (elevator.indicatorsToDirectionNum() === 1) {
                    curFloor.setRequest(1,0);
                }
                if (elevator.indicatorsToDirectionNum() === -1) {
                    curFloor.setRequest(-1,0);
                }
                else {
                    curFloor.setRequest(1,0);
                    curFloor.setRequest(-1,0);
                }
                elevator.whatDo();
            });
        });
        floors.forEach(function (floor) {
            floor.on("up_button_pressed", function() {
                // l
                floor.setRequest(1, 1);

                elevators.forEach(function (elevator) { elevator.whatDo() })
            });
            floor.on("down_button_pressed", function() {
                // l
                floor.setRequest(-1, 1);
                
                elevators.forEach(function (elevator) { elevator.whatDo() })
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}