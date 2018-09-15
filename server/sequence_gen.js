module.exports = class SequenceGen {
	constructor(items){
		this.items = items;
		if(items.length === 0)
			throw new Error("Expected at least 1 item in sequence.");
		this.seq = [0];
	}
	
	inc(){
		let i = -1;
		while(++i < this.seq.length){
			if(this.seq[i] === this.items.length - 1){
				this.seq[i] = 0;
				if(i === this.seq.length - 1)
					this.seq.push(0);
				continue;
			} else {
				this.seq[i] = this.seq[i] + 1;
				return;
			}
		}
	}
	
	next(){
		let result = this.seq.map(x => this.items[x]).reverse();
		this.inc();
		return result;
	}
	
	nextList(count){
		let res = [];
		while(count-->0)
			res.push(this.next())
		return res;
	}
}