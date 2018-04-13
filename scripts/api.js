
const api = (function() {

	const BASE_URL = 'https://thinkful-list-api.herokuapp.com/gianluca/';

	function getBookmarks(success, error) {

		const options = {
			url:`${BASE_URL}bookmarks`,
			method: 'GET',
			contentType: 'application/json',
			success: success,
			error: error,
		};
		$.ajax(options);
	}
	function addBookmark(bookmark, success, error) {

		const options = {
			url:`${BASE_URL}bookmarks`,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(bookmark),
			success: success,
			error: error,
		};
		$.ajax(options);
	}

	function updateBookmark(id, updateData, success, error) {

		const options = {
			url:`${BASE_URL}bookmarks/${id}`,
			method: 'PATCH',
			contentType: 'application/json',
			data: JSON.stringify(updateData),
			success: success,
			error: error,
		};
		$.ajax(options);
	}

	function deleteBookmark(id, success, error) {

		const options = {
			url:`${BASE_URL}bookmarks/${id}`,
			method: 'DELETE',
			contentType: 'application/json',
			success: success,
			error: error,
		};
		$.ajax(options);
	}

	return {
		getBookmarks,
		addBookmark,
		updateBookmark,
		deleteBookmark,
	};
}());