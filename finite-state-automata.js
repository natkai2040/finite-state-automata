
/////////////////////////////////////////
//    FSA CLASS
/////////////////////////////////////////
class FSA {
  constructor() {
      ///////////////////////
      ///// STATE CLASS /////
      ///////////////////////
    class State {
      // constructor(name: string): creates a state with the given name
      constructor(name) {
        this.name = name; 
        let trs = []; //holds StateTransitions {key: State}
        //getName(): string: returns the name of the state
        this.getName = () => this.name;
        //setName(s: string): returns this
        // Changes the name of the state. Assume no other state with the given name exists. 
        // Changing the name of a state should not affect FSA behavior.
        this.setName = s => {this.name = s};
        //changeDest(oldState: State, newState: State)
        //HELPER: changes all pointer to oldState to newState
        this.changeDest = (oldState, newState) => {
          for (let i = 0; i < trs.length; ++i) {
            let event = Object.keys(trs[i])[0];
            if (lib220.getProperty(trs[i], event).value === oldState) { //if it points to the old state
              let newTrs = {}; 
              lib220.setProperty(newTrs, event, newState); //create a new transition pointing to new state
              trs[i] = newTrs; //replace the old transition with the new one
            }
          } // If it doesn't point to the oldstate, do nothing
        };
        //addTransition(e: string, s: State): this
        //adds a transition that on event e moves to state s.
        this.addTransition = (e, s) => {
          let move = {};
          lib220.setProperty(move,e,s);
          trs.push(move);
          return this;
        };
        //nextState(e: string): State: returns the next state as a result of event e
        // If several moves exist,it returns one at random
        // it should be possible to return any successor. 
        // If no move exists, return undefined.
        this.nextState = (e) => {
          let eMoves = this.nextStates(e); 
          switch (eMoves.length) {
            case 1: {return eMoves[0]}
            case 0: {return undefined;}
            default: {
              let b = Math.floor(Math.random() * eMoves.length);// random number
              return eMoves[b];}
          }
        };
        //nextStates(e: string): State[]
        //Returns an array of all successor states as a result of event e.
        this.nextStates = (e) => {
          return (trs.filter(t => lib220.getProperty(t, e).found)).map(t => lib220.getProperty(t,e).value);
        };
      }
    }
    /////////////////////////
    ///// MEMENTO CLASS /////
    /////////////////////////
    class Memento { 
      constructor() {
        this.saved = undefined;
        //storeState(s: string): void,
        // takes a state name as input, and saves it so it can be restored
        this.storeState = (s) => {this.saved = s;};
        //getState(): string
        //which returns the state name stored in the memento object
        this.getState = () => {
          return this.saved;
        };
      }
    }
    /////////////////////////
    ///// FSA FUNCTIONS /////
    /////////////////////////
    
    //nextState(e: string): this
    // takes as argument an event and returns this
    //This method changes the current state of the automaton by calling the nextState() 
    //method of the current state. It does nothing if the current state is undefined.
    this.nextState = (e) => {
      if (curState !== undefined) {
        let next = curState.nextState(e); //gets the next state
 //       if (next !== undefined) { 
          curState = next; 
 //         } //if the next state exists, change curState
      }
      return this;
    };
    // createState(s: string, transitions: Transition[]): returns this.
    // The arguments are a string with the name of the state to be created, and an array of transitions. 
    this.createState = (s, transitions) => {
      let oldSt = stateFromName(s); //stores reference to oldState, a state that shares the name of newSt
      allSt = allSt.filter(st => (st.getName() !== s)); //removes all states with the same name as s, only reference is here
      let newSt = new State(s); //declares new state newSt
      if (oldSt !== undefined) { //if there is a state that shared the name of newSt
        changeAllDests(oldSt, newSt); //replaces all destinations in the States that have oldSt with newSt
        if (oldSt === curState) { curState = newSt; } //if oldState was curState, then the curState is now the newSt
      }
      allSt.push(newSt); // pushes newSt to the array
      if (!firstStateDeclared) {curState = newSt; firstStateDeclared = true;} //curState assigned to newState if the first has not yet been declared
      transitions.forEach(tr => {this.addTransition(s, tr);}); //addTransition is called on newState and all transitions in the array
      //HELPER: Changes all Destinations within all State Objects to point to new state
      //changeALlDests(oldState: State, newState: State):this
      function changeAllDests(oldState, newState) {
        allSt.forEach(st => {st.changeDest(oldState, newState);});
      }
      return this;
    };
    // A transition is an object with one property: type Transition = { [key: string]: string }, 
    // Where the key is an event name, and the value is the name of the next state on receiving the event.
    // Several transitions may exist for one event (the automaton is nondeterministic). 

    // addTransition(s: string, t: Transition): returns this
    // adds a transition to the state with name s, using the addTransition method of that state. 
    // Adding a transition (including with createState()) creates source and target states if they do not already exist.
    this.addTransition = (s, t) => {
      //sort of repeats the initialization code.
      let source = stateFromName(s); //searches if there is a state with the name
      if (source === undefined) { //adds source state if it does't exist
        source = new State(s);
        allSt.push(source);
        if (!firstStateDeclared) {curState = source; firstStateDeclared = true;}
      }
      let event = Object.keys(t)[0]; //gets the transition event
      let destName = lib220.getProperty(t, event).value; //gets the destination state name
      let dest = stateFromName(destName);
      if (dest === undefined) {
        dest = new State(destName); //adds destination state if it doesn't exist
        allSt.push(dest);
      }
      source.addTransition(event, dest);
      return this;
    };
    //helper method that returns the state given a name, otherwise returns undefined
    function stateFromName(name){
      let match = allSt.filter(st => (st.getName() === name));
      switch (match.length){
        case 0: {return undefined;}
        case 1: {return match[0];}
        default: {console.log("there cannot be multiple of same named state"); assert(false);}        
      }
    }
    // showState(): string: returns the name of the current state, or undefined.
    this.showState = () => {
      if (curState === undefined) { 
        return undefined;
      } else {
        return curState.getName();
      }
    };
    // renameState(oldName, newName): returns this
    // If a state called oldName exists, renames it to newName, else does nothing. 
    // Assume no other state called newName exists.
    this.renameState = (oldName, newName) => {
      let change = stateFromName(oldName); 
      if (change !== undefined) {
        change.setName(newName);
      }
      return this;
    };
    //createMemento(): Memento: 
    //creates a memento object with the name of the current state.
    this.createMemento = () => {
      let mem = new Memento();
      if (curState === undefined) { 
        mem.storeState(undefined);
      } else {
        mem.storeState(curState.getName());
      }
      return mem;
    };
    //restoreMemento(m: Memento): this
    // takes a memento object and restores the FSA state to the
    //state named in the memento object; it does nothing if no such state exists. It returns this.
    this.restoreMemento = (m) => {
      let mStateName = m.getState();
      if (mStateName !== undefined) { //mStateName isn't undefined
        let mState = stateFromName(mStateName);
        if (mState !== undefined) { curState = mState;}
      }
      return this;
    };
    /////////////////////////
    //// CLASS VARIABLES ////
    /////////////////////////
    let allSt = [];
    let curState = undefined;
    let firstStateDeclared = false;

  }
}

let d = new FSA();

function test(testName, testToRun) {
  // Create Output String
  let testOutputMessage = ""; 
  try {
    testToRun(); 
  } catch (error) {
    testOutputMessage += testName + ": FAILED\n"; 
    testOutputMessage += "Error: " + error; 
  }
  testOutputMessage += testName + ": SUCCESS\n"; 
  // Print Output
  console.log(testOutputMessage)
}

// can go in any direction with eMoves random

// you can replace a state with the same name with createState

//you can replace a changed-name state with createState

//create state creates states in transition functions
test('create state creates states', function() {
  let fsa = new FSA();
  fsa.createState("columbus", [{nina: "a"},{pinta: "b"},{santa: "c"}]);
  //assert that its length is 4. 
});

//rename state works
test('rename states', function() {
  let fsa = new FSA();
  fsa.createState("OLD", []);
  fsa.renameState("OLD", "NEW");
  //assert that its length is 1.
  //assert that the only state is one called "NEW"
  let fsa2 = new FSA(); 
  fsa2.createState("UNCHANGED", []);
  fsa.renameState("OLD", "NEW");
  // assert that its length is 2
});

test('washing machine test', function() {
  let myMachine = new FSA().createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}]).createState("normal, low", [{mode: "delicates, low"}, {temp: "normal, medium"}]).createState("delicates, medium", [{mode: "normal, medium"},{temp: "delicates, low"}]).createState("normal, medium", [{mode:"“delicates, medium"},{temp: "normal, high"}]).createState("normal, high", [{mode: "delicates, medium"},{temp: "normal, low"}]);
  assert(myMachine.showState() === "delicates, low");
  myMachine.nextState("temp");
  assert(myMachine.showState() === "delicates, medium");
  myMachine.nextState("mode");
  assert(myMachine.showState() === "normal, medium");
  myMachine.nextState("temp");
  assert(myMachine.showState() === "normal, high");

  let restoreTo = myMachine.createMemento(); // creates memento from current state
  console.log(restoreTo.getState()); // prints name of state in memento
  myMachine.nextState("mode").nextState("temp");
  assert(myMachine.showState() === "delicates, low");
  myMachine.restoreMemento(restoreTo);
  // restores the machine to normal, high
  console.log(myMachine.showState());
  assert(myMachine.showState() === "normal, high");
});