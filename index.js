const Immutable = require('immutable');

const { List, Map } = Immutable;

const derived = {
  fold(empty) {
    return this.foldMap((x) => x, empty);
  },
  foldMap(f, empty) {
    return empty != null
      ? this.reduce((acc, x, i) => acc.concat(f(x, i)), empty)
      : this.map(f).reduce((acc, x) => acc.concat(x));
  },
  sequence(point) {
    return this.traverse(point, (x) => x);
  },
};

// List
//= ===================

// monoid
List.empty = List();
List.prototype.empty = List.empty;

// traversable
List.prototype.traverse = function traverse(point, f) {
  return this.reduce((ys, x) => ys.map((y) => (z) => y.concat([z])).ap(f(x)), point(this.empty));
};

List.prototype.sequence = derived.sequence;

// foldable
List.prototype.fold = derived.fold;
List.prototype.foldMap = derived.foldMap;

// applicative
List.prototype.ap = function ap(other) {
  return this.map((f) => other.map((x) => f(x))).flatten();
};

// monad
List.prototype.chain = List.prototype.flatMap;

// comonad#extend - extract needs list to be non empty
List.prototype.extend = function _List(f) {
  return this.map((x, i) => f(this.slice(i)));
};

// Map
//= ==============

// semigroup
Map.prototype.concat = function _Map(other) {
  return this.mergeWith((prev, next) => prev.concat(next), other);
};

// monoid
Map.empty = Map({});
Map.prototype.empty = Map.empty;

// foldable
Map.prototype.fold = derived.fold;
Map.prototype.foldMap = derived.foldMap;

// traversable
Map.prototype.traverse = function _Map(point, f) {
  return this.reduce((acc, v, k) => f(v, k).map((x) => (y) => y.merge({ [k]: x })).ap(acc), point(this.empty));
};

Map.prototype.sequence = derived.sequence;

// monad
Map.prototype.chain = Map.prototype.flatMap;

// comonad#extend - extract needs to be paired with a key
Map.prototype.extend = function _Map(f) {
  return this.map(() => f(this));
};

module.exports = Immutable;
