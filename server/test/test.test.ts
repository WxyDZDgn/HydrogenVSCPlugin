import { expect } from 'chai';
import { describe, it } from 'mocha';

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
