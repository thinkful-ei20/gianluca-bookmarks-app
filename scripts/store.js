
const store = (function(){

	function add(bookmark) {
		this.bookmarks.push(bookmark);
	}

	function findById(id) {
		return this.bookmarks.find(bm => bm.id === id);
	}

	function findAndDelete(id) {
		this.bookmarks = this.bookmarks.filter(bm => bm.id !== id);
	}

	function findAndUpdate(id, newData) {
		const bm = this.bookmarks.find(bm => bm.id === id);
		Object.assign(bm, newData);
	}
	return {
		bookmarks:[],
		sortBy:'',
		errorMessage:'',
		add,
		findAndDelete,
		findAndUpdate,
		findById,
	};
}());
