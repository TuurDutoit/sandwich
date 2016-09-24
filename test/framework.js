import compare from "./compare-canvas.js";

export class Test {
  constructor(id, opts) {
    let $container = Test.createContainer(id);
    let $actual = Test.createCanvas("actual");
    let $title = Test.createTitle(opts.title);
    let $description = Test.createDescription(opts.description);
    let $goal = Test.createGoal(opts.goal);
    let $expected = Test.createCanvas("expected");
    let $results = Test.createResults();

    $results.appendChild($actual);
    $results.appendChild($expected);

    $container.appendChild($title);
    $container.appendChild($description);
    $container.appendChild($goal);
    $container.appendChild($results);

    this.id = id;
    this.logs = [];
    this._init = opts.init;
    this._test = opts.test;
    this._expected = opts.expected;
    this.title = opts.title;
    this.description = opts.description;
    this.goal = opts.goal;
    this.$container = $container;
    this.$title = $title;
    this.$description = $description;
    this.$actual = $actual;
    this.$expected = $expected;
    this.actualCtx = $actual.getContext("2d");
    this.expectedCtx = $expected.getContext("2d");
  }

  init() {
    this.state = "init";
    this._init();
    this.$container.classList.add("init");
  }

  test() {
    this.captureLogs();
    this.state = "test";

    test: {
      try {
        var res = this._test();
      }
      catch(e) {
        this.error = e;
        break test;
      }

      if(res === false) {
        this.error = new Error("Test returned false. That's all we know, please check the logs.");
        break test;
      }
      else if(res instanceof Error) {
        this.error = res;
        break test;
      }

      if(this._expected) {
        this.state = "expected";
        this._expected();
      }

      if(!compare(this.actualCtx, this.expectedCtx)) {
        this.error = new Error("Test canvas doesn't match expected. Happy bug hunting!");
      }
      else {
        this.error = null;
      }
    }

    this.success = !this.error;
    this.fail = !this.success;

    this.$container.classList.add("done");
    this.$container.classList.toggle("success", this.success);
    this.$container.classList.toggle("fail", this.fail);

    this.dontCaptureLogs();

    return this.success;
  }

  captureLogs() {
    console._log = console.log;
    console.log = (...messages) => {
      this.logs.push(messages);
      console._log.apply(console, messages);
    }
  }

  dontCaptureLogs() {
    console.log = console._log;
  }

  get ctx() {
    return this.state === "expected" ? this.expectedCtx : this.actualCtx;
  }

  get $canvas() {
    return this.state === "expected" ? this.$expected : this.$actual;
  }

  static createContainer(id) {
    let $container = document.createElement("div");
    $container.classList.add("test");
    $container.dataset.id = id;

    return $container;
  }

  static createCanvas(name) {
    let $canvas = document.createElement("canvas");
    $canvas.setAttribute("width", "100");
    $canvas.setAttribute("height", "100");
    $canvas.classList.add(name);

    return $canvas;
  }

  static createTitle(title) {
    let $title = document.createElement("h1");
    $title.classList.add("title");
    $title.textContent = title;

    return $title;
  }

  static createDescription(content) {
    let $description = document.createElement("p");
    $description.classList.add("description");
    $description.textContent = content;

    return $description;
  }

  static createGoal(content) {
    let $goal = document.createElement("p");
    $goal.classList.add("goal");
    $goal.textContent = content;

    return $goal;
  }

  static createResults() {
    let $results = document.createElement("div");
    $results.classList.add("results");

    return $results;
  }
}





export class Tests {
  constructor($tests, $stats) {
    this.$tests = $tests;
    this.$stats = $stats;
    this.tests = {};
    this._id = 0;

    this.createStats();
  }

  add(opts) {
    let test = new Test(this.id(), opts);
    this.addTest(test);
  }

  addTest(test) {
    this.tests[test.id] = test;
    this.$tests.appendChild(test.$container);
    test.init();
  }

  test() {
    let passing = 0;
    let failing = 0;

    Object.keys(this.tests).forEach(id => {
      let test = this.tests[id];
      console.log("");
      console.log(test.title);
      console.log("=".repeat(test.title.length));
      let success = test.test();

      if(!success) {
        failing++;
        console.log("");
        console.log("ERROR:", test.error);
      }
      else {
        passing++;
      }
    });

    this.updateStats(passing, failing);
  }

  get(id) {
    return this.tests[id];
  }

  id() {
    return (this._id++)+"";
  }

  createStats() {
    this.$passing = this.$stats.querySelector(".passing-num");
    this.$failing = this.$stats.querySelector(".failing-num");
  }

  updateStats(passing, failing) {
    this.$passing.textContent = passing;
    this.$failing.textContent = failing;
  }
}
