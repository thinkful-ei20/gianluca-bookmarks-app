/*global store, api */

const bookmarkit = (function() {

	function clearForm(form) {
		form.find(':input[name=title]').val('');
		form.find(':input[name=url]').val('');
		form.find(':input[name=description]').val('');
		form.find(':input[name=rate]:checked').prop('checked',false);
	}

	function generateErrorMessage(errorMessage){
		return `<button type="button" class="error-button">${errorMessage}</button>`;
	}
	function generateRadioButtons(rating) {
		let html = '';
		for(let i = 0; i < 5; i++) {
			if(i < rating) {
				html+=`<label><input type="radio" value="${i+1}" id="bm-rating-${i+1}" name="rate" checked>${i+1}</label>`;
			} else {
				html+=`<label><input type="radio" value="${i+1}" id="bm-rating-${i+1}" name="rate">${i+1}</label>`;
			}
		}
		return html;
	}
	function generateExpandedBookmark(bm) {
		if(bm.edit) {
			return `<li class="bookmark-list-item" id="${bm.id}">
			<div class="li-controls">
				<button class="li-ctrl-btn expand">Expand</button>
				<button class="li-ctrl-btn edit">Edit</button>
				<button class="li-ctrl-btn delete">Delete</button>
			</div>
			<div class="bookmark">
				<p class="bm-title">${bm.title}</p>
				<span class="bm-url"><a href="${bm.url}">${bm.url}</a></span>
				<form id="js-bm-edit-form">
				<textarea name="description" class="bm-desc">${bm.desc}</textarea>
				<radiogroup class="edit-rd-grp">
				<label>Rating</label>
					${generateRadioButtons(bm.rating)}
				</radiogroup>
					<button type="submit" class="save-edits">Save</button>
				</form>	
			</div>
		</li>`;
		}
		return `<li class="bookmark-list-item" id="${bm.id}">
		<div class="li-controls">
			<button class="li-ctrl-btn expand">Expand</button>
			<button class="li-ctrl-btn edit">Edit</button>
			<button class="li-ctrl-btn delete">Delete</button>
		</div>
		<div class="bookmark">
			<p class="bm-title">${bm.title}</p>
			<span class="bm-url"><a href="${bm.url}">${bm.url}</a></span>
			<p class="bm-desc">${bm.desc}</p>
			<span class="bm-rating">Rating: ${bm.rating}</span>
		</div>
	</li>`;
	}

	function generateBookmark(bm) {
		return `<li class="bookmark-list-item" id="${bm.id}">
		<div class="li-controls">
			<button class="li-ctrl-btn expand">Expand</button>
			<button class="li-ctrl-btn edit">Edit</button>
			<button class="li-ctrl-btn delete">Delete</button>
		</div>
		<div class="bookmark">
			<p class="bm-title">${bm.title}</p>
			<span class="bm-rating">Rating: ${bm.rating}</span>
		</div>
	</li>`;
	}

	function generateBookmarkString(bookmarks) {
		const bms = bookmarks.
			filter(bm => store.searchText.length === 0 || bm.title.indexOf(store.searchText) > -1).
			sort((a,b) => {
				switch(store.sortBy) {
				case 'rate-asc':
					console.log('made it to rate-asc');
					return a.rating - b.rating;
				case 'rate-desc':
					console.log('made it to rate-desc');
					return b.rating - a.rating;
				case 'alpha-asc':
					console.log('made it to alpha-asc');
					return a.title.toUpperCase() - b.title.toUpperCase();
				case 'alpha-desc':
					console.log('made it to alpha-desc');
					return b.title.toUpperCase() - a.title.toUpperCase();
				default:
					return 0;
				}
			}).map(bm => bm.expanded ? generateExpandedBookmark(bm) : generateBookmark(bm));
		return bms.join('');
	}

	function handleAddBookmark() {
		$('.js-add-bm').on('click', (event) => {
			event.preventDefault();
			console.log('click');
			store.modal = true;
			render();
		});
	}

	function validateURL(url) {
		if(!url.toLowerCase().includes('https://') || !url.toLowerCase().include('http://')){
			return 'https://'+url;
		}
		return url;
	}

	function handleCreateBookmark() {
		$('.js-create-bm-modal').on('submit', (event) => {
			event.preventDefault();
			const form = $(event.target);
			let rating = form.find(':input[name=rate]:checked').val();
			let desc = form.find(':input[name=description]').val();
			const bmData = {
				title: form.find(':input[name=title]').val(),
				url: validateURL(form.find(':input[name=url]').val()),
				desc: desc ? desc : 'No Description Provided',
				rating: rating ? rating : '3',
			};
			clearForm(form);
			$('.js-create-bm-modal').css('display', 'none');
			api.addBookmark(bmData, (response) => {
				store.add(response);
				store.modal = false;
				render();
			}, (error) => {
				store.setError(error.responseJSON.message);
				render();
			});
		});
	}

	function handleDeleteBookmark() {
		$('.js-bm-list').on('click', '.delete', (event) => {
			let id = $(event.target).closest('li').attr('id');
			api.deleteBookmark(id,(response) => {
				store.findAndDelete(id);
				render();
			}, (error) => {
				store.setError(error.responseJSON.message);
				render();
			});
		});
	}

	function handleExpandBookmark() {
		$('.js-bm-list').on('click', '.expand', (event) => {
			let id = $(event.target).closest('li').attr('id');
			let bookmark = store.findById(id);
			if(bookmark.expanded && bookmark.edit) {
				bookmark.expanded = !bookmark.expanded;
				bookmark.edit = false;
				render();
			}
			else if(!bookmark.expanded) {
				bookmark.expanded = !bookmark.expanded;
				render();
			} else {
				bookmark.expanded = !bookmark.expanded;
				render();
			}
		});
	}

	function handleEditBookmark() {
		$('.js-bm-list').on('click', '.edit', (event) => {
			let id = $(event.target).closest('li').attr('id');
			let bookmark = store.findById(id);
			if(!bookmark.edit && !bookmark.expanded) {
				bookmark.edit = !bookmark.edit;
				bookmark.expanded = true;
				render();
			} else if(!bookmark.edit) {
				bookmark.edit = !bookmark.edit;
				render();
			} else {
				bookmark.edit = !bookmark.edit;
				render();
			}
		});
	}

	function handleEdits() {
		$('.js-bm-list').on('click', '.save-edits', (event) => {
			event.preventDefault();
			const $li = $(event.target).closest('li');
			const id = $li.attr('id');
			const bookmark = store.findById(id);
			const desc = $li.find(':input[name=description]').val();
			const rating = $li.find(':input[name=rate]:checked').val();
			if( bookmark.desc !== desc || bookmark.rating !== rating) {
				api.updateBookmark(id, {desc:desc, rating:rating}, (response) =>{
					store.findAndUpdate(id, {desc:desc, rating:rating});
					render();
				}, (error) => {
					store.setError(error.responseJSON.message)
					render();
				});
			} else {
				store.setError('No Changes Made');
				store.edit = false;
				store.modal = false;
				render();
			}
		});
	}

	function handleSortBookmark() {
		$('.js-sortby').on('change', (event) => {
			store.sortBy = $(event.target).find(':selected').val();
			render();
		});
	}

	function handleSearchBookmark() {
		$('.js-bm-list-search-entry').keyup( event => {
			const searchText = $(event.currentTarget).val();
			store.setSearchTerm(searchText);
			render();
		});
	}

	function handleCloseCreateButton() {
		$('.close-btn').on('click', (event) => {
			console.log('click');
			store.modal = false;
			render();
		});
	}

	function handleErrorMessage() {
		$('.error').on('click', '.error-button', (event) => {
			store.setError('');
			render();
		});
	}

	function render() {
		console.log('`render` ran');
		store.modal ? $('.js-create-bm-modal').css('display','block') : $('.js-create-bm-modal').css('display','none');
		store.bookmarks.length === 0 ? $('.js-bm-list').html('<p>There are no bookmarks</p>') : $('.js-bm-list').html(generateBookmarkString(store.bookmarks));
		store.errorMessage !== '' ? $('.error').html(generateErrorMessage(store.errorMessage)) : $('.error').html('');
	}

	function init() {
		api.getBookmarks((bms) => {
			bms.forEach((b) => store.add(b));
			store.sortBy = $('.js-sortby').find(':selected').val();
			$('.js-bm-list-search-entry').val('');
			render();
		});
	}

	function bindEventListeners() {
		init();
		handleSortBookmark();
		handleSearchBookmark();
		handleAddBookmark();
		handleCreateBookmark();
		handleDeleteBookmark();
		handleEditBookmark();
		handleEdits();
		handleExpandBookmark();
		handleErrorMessage();
		handleCloseCreateButton();
	}

	return {
		bindEventListeners,
	};
}());