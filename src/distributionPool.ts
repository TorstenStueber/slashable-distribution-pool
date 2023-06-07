const T = ["t", "*"];
const M = ["a", "b"];

interface DistributionPool {
  increaseStake(m: string, x: number): void;
  decreaseStake(m: string, x: number): void;
  slashStake(x: number): void;
  getStake(m: string): number;
  distributeReward(x: number, t: string): void;
  getReward(m: string, t: string): number;
  withdrawReward(m: string, t: string): number;

  displayState(): void;
}

class NaiveImplemenataion implements DistributionPool {
  s: Record<string, number> = {};
  S: number = 0;
  p: Record<string, Record<string, number>> = {};

  increaseStake(m: string, x: number): void {
    if (this.s[m] === undefined) this.s[m] = 0;
    this.s[m] += x;
    this.S += x;
  }

  decreaseStake(m: string, x: number): void {
    if (this.s[m] === undefined) this.s[m] = 0;
    if (x <= this.s[m]) {
      this.s[m] -= x;
      this.S -= x;
    }
  }

  slashStake(x: number): void {
    if (x <= this.S) {
      M.forEach((m) => {
        if (this.s[m] === undefined) this.s[m] = 0;
        this.s[m] -= (x * this.s[m]) / this.S;
      });
      this.S -= x;
    }
  }

  getStake(m: string): number {
    return this.s[m] ?? 0;
  }

  distributeReward(x: number, t: string): void {
    M.forEach((m) => {
      if (this.p[m] === undefined) this.p[m] = {};
      if (this.p[m][t] === undefined) this.p[m][t] = 0;
      this.p[m][t] += (x * this.s[m]) / this.S;
    });
  }

  getReward(m: string, t: string): number {
    return this.p[m]?.[t] ?? 0;
  }

  withdrawReward(m: string, t: string): number {
    if (this.p[m] === undefined) this.p[m] = {};
    const x = this.p[m][t] ?? 0;
    this.p[m][t] = 0;
    return x;
  }

  displayState(): void {}
}

class AmbitiousImplemenataion implements DistributionPool {
  u: Record<string, number> = {};
  S: number = 0;
  p: Record<string, Record<string, number>> = {};

  increaseStake(m: string, x: number): void {
    if (this.u[m] === undefined) this.u[m] = 0;
    this.u[m] += x;
    this.S += x;
  }

  decreaseStake(m: string, x: number): void {
    if (this.u[m] === undefined) this.u[m] = 0;
    if (this.p[m] === undefined) this.p[m] = {};

    if (x <= this.u[m] - (this.p[m]["*"] ?? 0)) {
      this.u[m] -= x;
      this.S -= x;
    }
  }

  slashStake(x: number): void {
    if (x <= this.S) {
      this.distributeReward(x, "*");
      this.S -= x;
    }
  }

  getStake(m: string): number {
    if (this.u[m] === undefined) this.u[m] = 0;
    if (this.p[m] === undefined) this.p[m] = {};
    return this.u[m] - (this.p[m]["*"] ?? 0);
  }

  distributeReward(x: number, t: string): void {
    M.forEach((m) => {
      if (this.p[m] === undefined) this.p[m] = {};
      if (this.p[m][t] === undefined) this.p[m][t] = 0;
      this.p[m][t] += (x * (this.u[m] - (this.p[m]["*"] ?? 0))) / this.S;
    });
  }

  getReward(m: string, t: string): number {
    return this.p[m]?.[t] ?? 0;
  }

  withdrawReward(m: string, t: string): number {
    if (this.p[m] === undefined) this.p[m] = {};
    const x = this.p[m][t] ?? 0;
    this.p[m][t] = 0;
    if (t === "*") {
      if (this.u[m] === undefined) this.u[m] = 0;
      this.u[m] -= x;
    }
    return x;
  }

  displayState(): void {
    console.log(
      `Ambitious: u = ${JSON.stringify(this.u)}, S = ${JSON.stringify(this.S)}, p = ${JSON.stringify(this.p)}`
    );
  }
}

class EfficientImplementation implements DistributionPool {
  u: Record<string, number> = {};
  S: number = 0;
  r: Record<string, number> = {};
  q: Record<string, Record<string, number>> = {};

  increaseStake(m: string, x: number): void {
    if (this.u[m] === undefined) this.u[m] = 0;
    this.u[m] += x;
    this.S += x;

    if (this.q[m] === undefined) this.q[m] = {};
    T.forEach((t) => {
      if (this.q[m][t] === undefined) this.q[m][t] = 0;
      if (this.r[t] === undefined) this.r[t] = 0;

      this.q[m][t] += x * this.r[t];
    });
  }

  decreaseStake(m: string, x: number): void {
    if (this.u[m] === undefined) this.u[m] = 0;
    if (this.q[m] === undefined) this.q[m] = {};
    if (this.r["*"] === undefined) this.r["*"] = 0;

    if (x * (1 + this.r["*"]) <= this.u[m] + (this.q[m]["*"] ?? 0)) {
      this.u[m] -= x;
      this.S -= x;

      T.forEach((t) => {
        if (this.q[m][t] === undefined) this.q[m][t] = 0;
        if (this.r[t] === undefined) this.r[t] = 0;

        this.q[m][t] -= x * this.r[t];
      });
    }
  }

  slashStake(x: number): void {
    if (x <= this.S) {
      if (this.r["*"] === undefined) this.r["*"] = 0;
      this.r["*"] += x / this.S;
      this.S -= x;
    }
  }

  getStake(m: string): number {
    if (this.u[m] === undefined) this.u[m] = 0;
    if (this.q[m] === undefined) this.q[m] = {};
    if (this.r["*"] === undefined) this.r["*"] = 0;

    return (this.u[m] + (this.q[m]["*"] ?? 0)) / (1 + this.r["*"]);
  }

  distributeReward(x: number, t: string): void {
    if (this.r[t] === undefined) this.r[t] = 0;
    this.r[t] += x / this.S;
  }

  getReward(m: string, t: string): number {
    if (this.u[m] === undefined) this.u[m] = 0;
    if (this.r["*"] === undefined) this.r["*"] = 0;
    if (this.r[t] === undefined) this.r[t] = 0;
    if (this.q[m] === undefined) this.q[m] = {};

    return (this.r[t] * (this.u[m] + (this.q[m]["*"] ?? 0))) / (1 + this.r["*"]) - (this.q[m][t] ?? 0);
  }

  withdrawReward(m: string, t: string): number {
    const x = this.getReward(m, t);
    this.q[m][t] = (this.r[t] * (this.u[m] + (this.q[m]["*"] ?? 0))) / (1 + this.r["*"]);
    if (t === "*") {
      this.u[m] -= x;
    }
    return x;
  }

  displayState(): void {
    console.log(
      `Efficient: u = ${JSON.stringify(this.u)}, S = ${JSON.stringify(this.S)}, r = ${JSON.stringify(
        this.r
      )}, q = ${JSON.stringify(this.q)}`
    );
  }
}

class EfficientImplementation1 implements DistributionPool {
  b: Record<string, number> = {};
  B: number = 1;
  v: Record<string, number> = {};
  S: number = 0;
  p: Record<string, Record<string, number>> = {};

  increaseStake(m: string, x: number): void {
    if (this.v[m] === undefined) this.v[m] = 0;
    if (this.b[m] === undefined) this.b[m] = 1;
    this.v[m] = (this.v[m] * this.B) / this.b[m] + x;
    this.b[m] = this.B;
    this.S += x;
  }

  decreaseStake(m: string, x: number): void {
    if (this.v[m] === undefined) this.v[m] = 0;
    if (this.b[m] === undefined) this.b[m] = 1;

    if (x <= (this.v[m] * this.B) / this.b[m]) {
      this.v[m] = (this.v[m] * this.B) / this.b[m] - x;
      this.b[m] = this.B;
      this.S -= x;
    }
  }

  slashStake(x: number): void {
    if (x <= this.S) {
      this.B *= 1 - x / this.S;
      this.S -= x;
    }
  }

  getStake(m: string): number {
    if (this.v[m] === undefined) this.v[m] = 0;
    if (this.b[m] === undefined) this.b[m] = 1;
    return (this.v[m] * this.B) / this.b[m];
  }

  distributeReward(x: number, t: string): void {
    M.forEach((m) => {
      if (this.p[m] === undefined) this.p[m] = {};
      if (this.p[m][t] === undefined) this.p[m][t] = 0;
      if (this.v[m] === undefined) this.v[m] = 0;
      if (this.b[m] === undefined) this.b[m] = 1;
      this.p[m][t] += (x * (this.v[m] * this.B)) / this.b[m] / this.S;
    });
  }

  getReward(m: string, t: string): number {
    return this.p[m]?.[t] ?? 0;
  }

  withdrawReward(m: string, t: string): number {
    if (this.p[m] === undefined) this.p[m] = {};
    const x = this.p[m][t] ?? 0;
    this.p[m][t] = 0;
    return x;
  }

  displayState(): void {}
}

class EfficientImplementation2 implements DistributionPool {
  b: Record<string, number> = {};
  B: number = 1;
  v: Record<string, number> = {};
  S: number = 0;
  q: Record<string, Record<string, number>> = {};
  r: Record<string, number> = {};

  increaseStake(m: string, x: number): void {
    if (this.v[m] === undefined) this.v[m] = 0;
    if (this.b[m] === undefined) this.b[m] = 1;
    this.v[m] = (this.v[m] * this.B) / this.b[m] + x;
    this.b[m] = this.B;
    this.S += x;

    if (this.q[m] === undefined) this.q[m] = {};
    T.forEach((t) => {
      if (this.q[m][t] === undefined) this.q[m][t] = 0;
      if (this.r[t] === undefined) this.r[t] = 0;
      this.q[m][t] += (x * this.r[t]) / this.B;
    });
  }

  decreaseStake(m: string, x: number): void {
    if (this.v[m] === undefined) this.v[m] = 0;
    if (this.b[m] === undefined) this.b[m] = 1;

    if (x <= (this.v[m] * this.B) / this.b[m]) {
      this.v[m] = (this.v[m] * this.B) / this.b[m] - x;
      this.b[m] = this.B;
      this.S -= x;

      if (this.q[m] === undefined) this.q[m] = {};
      T.forEach((t) => {
        if (this.q[m][t] === undefined) this.q[m][t] = 0;
        if (this.r[t] === undefined) this.r[t] = 0;
        this.q[m][t] -= (x * this.r[t]) / this.B;
      });
    }
  }

  slashStake(x: number): void {
    if (x <= this.S) {
      this.B *= 1 - x / this.S;
      this.S -= x;
    }
  }

  getStake(m: string): number {
    if (this.v[m] === undefined) this.v[m] = 0;
    if (this.b[m] === undefined) this.b[m] = 1;
    return (this.v[m] * this.B) / this.b[m];
  }

  distributeReward(x: number, t: string): void {
    if (this.r[t] === undefined) this.r[t] = 0;
    this.r[t] += (x * this.B) / this.S;
  }

  getReward(m: string, t: string): number {
    if (this.v[m] === undefined) this.v[m] = 0;
    if (this.b[m] === undefined) this.b[m] = 1;
    if (this.r[t] === undefined) this.r[t] = 0;
    if (this.q[m] === undefined) this.q[m] = {};
    if (this.q[m][t] === undefined) this.q[m][t] = 0;
    return (this.v[m] / this.b[m]) * this.r[t] - this.q[m][t];
  }

  withdrawReward(m: string, t: string): number {
    if (this.q[m] === undefined) this.q[m] = {};
    const x = this.getReward(m, t);
    this.q[m][t] = (this.v[m] / this.b[m]) * this.r[t];
    return x;
  }

  displayState(): void {}
}

export class TripleTest implements DistributionPool {
  naive: NaiveImplemenataion = new NaiveImplemenataion();
  ambitious: AmbitiousImplemenataion = new AmbitiousImplemenataion();
  efficient1: EfficientImplementation1 = new EfficientImplementation1();
  efficient2: EfficientImplementation2 = new EfficientImplementation2();

  increaseStake(m: string, x: number): void {
    this.naive.increaseStake(m, x);
    this.ambitious.increaseStake(m, x);
    this.efficient1.increaseStake(m, x);
    this.efficient2.increaseStake(m, x);
  }

  decreaseStake(m: string, x: number): void {
    this.naive.decreaseStake(m, x);
    this.ambitious.decreaseStake(m, x);
    this.efficient1.decreaseStake(m, x);
    this.efficient2.decreaseStake(m, x);
  }

  slashStake(x: number): void {
    this.naive.slashStake(x);
    this.ambitious.slashStake(x);
    this.efficient1.slashStake(x);
    this.efficient2.slashStake(x);
  }

  getStake(m: string): number {
    const a = this.naive.getStake(m);
    const b = this.ambitious.getStake(m);
    const c = this.efficient1.getStake(m);
    const d = this.efficient2.getStake(m);

    console.log(`getStake(${m}): ${a}, ${b}, ${c}, ${d}`);
    return 0;
  }

  distributeReward(x: number, t: string): void {
    this.naive.distributeReward(x, t);
    this.ambitious.distributeReward(x, t);
    this.efficient1.distributeReward(x, t);
    this.efficient2.distributeReward(x, t);
  }

  getReward(m: string, t: string): number {
    const a = this.naive.getReward(m, t);
    const b = this.ambitious.getReward(m, t);
    const c = this.efficient1.getReward(m, t);
    const d = this.efficient2.getReward(m, t);

    console.log(`getReward(${m}, ${t}): ${a}, ${b}, ${c}, ${d}`);
    return 0;
  }

  withdrawReward(m: string, t: string): number {
    const a = this.naive.withdrawReward(m, t);
    const b = this.ambitious.withdrawReward(m, t);
    const c = this.efficient1.withdrawReward(m, t);
    const d = this.efficient2.withdrawReward(m, t);

    console.log(`withdrawReward(${m}, ${t}): ${a}, ${b}, ${c}, ${d}`);
    return 0;
  }

  displayState(): void {
    this.naive.displayState();
    this.ambitious.displayState();
    this.efficient1.displayState();
    this.efficient2.displayState();
  }
}
