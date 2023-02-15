/*
 * Latch NodeJS SDK Example
 * Copyright (C) 2023 Telefonica Digital

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.

 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

var expect = require("chai").expect;
var config = require("../config.js");
var latch = require("../index.js");
 
describe("latch", function(){
    describe("#latch.init()", function(){
        it("should stop if the appId is missing", function(){
            var args = {secretKey: '1234'}
 
            expect(latch.init.bind(latch, args)).to.throw(Error);
            expect(latch.init.bind(latch, args)).to.throw(/specify both the appId and secretKey/);
        });
        
        it("should stop if the secretKey is missing", function(){
            var args = {appId: '1234'}
 
            expect(latch.init.bind(latch, args)).to.throw(Error);
            expect(latch.init.bind(latch, args)).to.throw(/specify both the appId and secretKey/);
        });
        
        it("should stop if the appId is not 20 chars", function(){
            var args = {appId: '1234', secretKey: '1234567890123456789012345678901234567890'}
 
            expect(latch.init.bind(latch, args)).to.throw(Error);
            expect(latch.init.bind(latch, args)).to.throw(/check your appId and secretKey/);
        });
        
        it("should stop if the secretKey is not 40 chars", function(){
            var args = {appId: '12345678901234567890', secretKey: '1234'}
 
            expect(latch.init.bind(latch, args)).to.throw(Error);
            expect(latch.init.bind(latch, args)).to.throw(/check your appId and secretKey/);
        });
        
        it("should parse the hostname into an URI object", function(){
            var args = {appId: '12345678901234567890', secretKey: '1234567890123456789012345678901234567890', hostname: 'https://latch.telefonica.com'}
 
            latch.init(args);
            expect(config.API_HOST.protocol).to.equal('https:');
            expect(config.API_HOST.hostname).to.equal('latch.telefonica.com');
        });
    });
    
    describe("Latch API requests", function(){
        it("should receive an API error", function(done){
            var args = {appId: '12345678901234567890', secretKey: '1234567890123456789012345678901234567890'}

            latch.init(args);
            var response = latch.status('1234', function(err, result) {
                expect(result).to.have.a.property('error').that.is.an('object');
                expect(result).to.have.deep.property('error.code', 102);
                expect(result).to.have.deep.property('error.message', 'Invalid application signature');
                done();
            });
        });
    });
});