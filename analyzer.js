/*
 * Semantic Analysis Context
 *
 * A context object holds state for the semantic analysis phase, such as the
 * enclosing function (if any), whether or not we are in a loop, a map of
 * declarations introduced in this scope, and the parent context.
 *
 *   const Context = require('./semantics/context');
 */

// const FunctionDeclaration = require('../ast/function-declaration');
// const FunctionObject = require('../ast/function-object');
// const Parameter = require('../ast/parameter');

class Context {
  constructor({ parent = null, currentFunction = null, inLoop = false } = {}) {
    Object.assign(this, { parent, currentFunction, inLoop, declarations: Object.create(null) });
  }

  createChildContextForFunctionBody(currentFunction) {
    // When entering a new function, we're not in a loop anymore
    return new Context({ parent: this, currentFunction, inLoop: false });
  }

  createChildContextForLoop() {
    // When entering a loop body, just set the inLoop field, retain others
    return new Context({ parent: this, currentFunction: this.currentFunction, inLoop: true });
  }

  createChildContextForBlock() {
    // For a simple block (i.e., in an if-statement), we have to retain both
    // the function and loop settings.
    return new Context({
      parent: this,
      currentFunction: this.currentFunction,
      inLoop: this.inLoop,
    });
  }

  // Call this to add a new entity (which could be a variable, a function,
  // or a parameter) to this context. It will check to see if the entity's
  // identifier has already been declared in this context. It does not need
  // to check enclosing contexts because in this language, shadowing is always
  // allowed. Note that if we allowed overloading, this method would have to
  // be a bit more sophisticated.
  add(entity) {
    this.declarations[entity.id] = entity.id;
  }

  variableMustNotBeAlreadyDeclared(id) {
    if (this.declarations[id]) {
      throw `${id} already declared`;
    }
  }

  // Returns the entity bound to the given identifier, starting from this
  // context and searching "outward" through enclosing contexts if necessary.
  lookup(id) {
    if (id in this.declarations) {
      return this.declarations[id];
    } else if (this.parent === null) {
      throw new Error(`Identifier ${id} has not been declared`);
    } else {
      return this.parent.lookup(id);
    }
  }

  assertInFunction(message) {
    if (!this.currentFunction) {
      throw new Error(message);
    }
  }

  assertIsFunction(entity) { // eslint-disable-line class-methods-use-this
    if (entity.constructor !== FunctionObject) {
      throw new Error(`${entity.id} is not a function`);
    }
  }
}

const INITIAL = new Context();
// new FunctionDeclaration('print', [new Parameter('_', null)], null).analyze(Context.INITIAL);
// new FunctionDeclaration('sqrt', [new Parameter('_', null)], null).analyze(Context.INITIAL);

module.exports = { INITIAL, Context };






// /* eslint-disable no-throw-literal */
// class AnalysisContext {
//   constructor(parent, inLoop) {
//     this.parent = parent;
//     this.symbolTable = Object.create(null);
//   }
//   createChildContext() {
//     return new AnalysisContext(this);
//   }
//   variableMustNotBeAlreadyDeclared(name) {
//     if (this.symbolTable[name]) {
//       throw `Variable ${name} already declared`;
//     }
//   }
//   addVariable(name, entity) {
//     this.symbolTable[name] = entity;
//   }
//   lookupVariable(name) {
//     const variable = this.symbolTable[name];
//     if (variable) {
//       return variable;
//     } else if (!this.parent) {
//       throw `Variable ${name} not found`;
//     }
//     return this.parent.lookupVariable(name);
//   }
// }
//
// exports.initialContext = () => new AnalysisContext(null);
