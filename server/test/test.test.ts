import { expect, assert } from 'chai';
import { describe, it } from 'mocha';

class Node {
	private type: string;
	public constructor(type = '') {
		this.type = type;
	}
	public checkTypeof(node: Node) {
		assert.strictEqual(typeof(this), typeof(node));
	}
}
class ExNode extends Node {
	public constructor() {
		super('ExNode');
	}
}
class AnotherExNode extends Node {
	public constructor() {
		super('ExNode');
	}
}

describe('add', () => {
	it('return the sum of the two numbers', () => {
		const result = 2 + 3;
		expect(result).to.equal(5);
	});
	it('return the sum of the two negative numbers', () => {
		const result = (-2) + (-3);
		expect(result).to.equal(-5);
	});

});

describe('extend 1', () => {
	it('same instance', () => {
		const node1 = new Node();
		const node2 = new Node();
		const exNode1 = new ExNode();
		const exNode2 = new ExNode();
		node1.checkTypeof(node2);
		exNode1.checkTypeof(exNode2);
	});
	
	it('different instance 1', () => {
		const node = new Node();
		const exNode = new ExNode();
		node.checkTypeof(exNode);
	});

	it('different instance 2', () => {
		const node = new Node();
		const exNode = new ExNode();
		exNode.checkTypeof(node);
	});

	it('different instance 3', () => {
		const exNode = new ExNode();
		const anotherExNode = new AnotherExNode();
		exNode.checkTypeof(anotherExNode);
	});

	it('different instance 4', () => {
		const exNode = new ExNode();
		const anotherExNode = new AnotherExNode();
		anotherExNode.checkTypeof(exNode);
	});
});

describe('extend 2', () => {
	it('same instance 1', () => {
		const node1 = new Node();
		const node2 = new Node();
		assert.strictEqual(node1.constructor, node2.constructor);
	});
	
	it('different instance 1', () => {
		const node = new Node();
		const exNode = new ExNode();
		assert.notStrictEqual(node.constructor, exNode.constructor);
	});

	it('different instance 2', () => {
		const exNode = new ExNode();
		const anotherExNode = new AnotherExNode();
		assert.notStrictEqual(exNode.constructor, anotherExNode.constructor);
	});
});

describe('extend 3', () => {
	it('same class', () => {
		const node = new Node();
		const exNode = new ExNode();
		const anotherExNode = new AnotherExNode();
		assert.strictEqual(node.constructor, Node);
		assert.strictEqual(exNode.constructor, ExNode);
		assert.strictEqual(anotherExNode.constructor, AnotherExNode);
	});

	it('different class', () => {
		const node = new Node();
		const exNode = new ExNode();
		const anotherExNode = new AnotherExNode();
		assert.notStrictEqual(node.constructor, ExNode);
		assert.notStrictEqual(node.constructor, AnotherExNode);
		assert.notStrictEqual(exNode.constructor, Node);
		assert.notStrictEqual(exNode.constructor, AnotherExNode);
		assert.notStrictEqual(anotherExNode.constructor, Node);
		assert.notStrictEqual(anotherExNode.constructor, ExNode);
	});
});
