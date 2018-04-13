/*global store, api */

const bookmarkit = (function(){

	function clearForm(form) {
		form.find(':input[name=title]').val('');
		form.find(':input[name=url]').val('');
		form.find(':input[name=description]').val('');
		form.find(':input[name=rate]:checked').prop('checked',false);
	}

	function generateExpandedBookmark(bm) {
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
			<span class="bm-rating">${bm.rating}</span>
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
			<span class="bm-rating">${bm.rating}</span>
		</div>
	</li>`;
	}

	function generateBookmarkList(bookmarks) {
		let html = '';
		bookmarks.forEach(bm => {
			html+= bm.expanded ? generateExpandedBookmark(bm): generateBookmark(bm);
		});
		return html;
	}

	function handleAddBookmark() {
		$('.js-add-bm').on('click', (event) => {
			event.preventDefault();
			$('.js-create-bm-modal').css('display', 'block');
		});
	}

	function handleCreateBookmark() {
		$('.js-create-bm-modal').on('submit', (event) => {
			event.preventDefault();
			const form = $(event.target);
			const bmData = {
				title: form.find(':input[name=title]').val(),
				url: form.find(':input[name=url]').val(),
				desc: form.find(':input[name=description]').val(),
				rating: form.find(':input[name=rate]:checked').val(),
			};
			clearForm(form);
			api.addBookmark(bmData, (response) => {
				store.add(response);
				$('.js-create-bm-modal').css('display', 'none');
				render();
			}, (error) => {
				console.log(error);
				render();
			});
		});
	}

	function handleDeleteBookmark() {
		$('.js-bm-list').on('click', '.delete', (event) => {
			let id = $(event.target).closest('li').attr('id');
			api.deleteBookmark(id,(response) => {
				store.findAndDelete(id);
				console.log(response);
				render();
			}, (error) => {
				console.log(error);
				render();
			});
		});
	}

	function handleExpandBookmark() {
		$('.js-bm-list').on('click', '.expand', (event) => {
			let id = $(event.target).closest('li').attr('id');
			let bookmark = store.findById(id);
			if(!bookmark.expanded) {
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
			console.log('edit');
		});
	}

	function render() {
		console.log('`render` ran');
		//store.bookmarks.length === 0 ? domEntry.html('<p>There are no bookmarks</p>') : domEntry.html(generateBookmarkList(store.bookmarks));
		if(store.bookmarks.length === 0) {
			$('.js-bm-list').html('<p>There are no bookmarks</p>');
		} else {
			$('.js-bm-list').html(generateBookmarkList(store.bookmarks));
		}
	}

	function init() {
		api.getBookmarks((bms) => {
			bms.forEach((b) => store.add(b));
			render();
		});
	}

	function bindEventListeners() {
		init();
		handleAddBookmark();
		handleCreateBookmark();
		handleDeleteBookmark();
		handleEditBookmark();
		handleExpandBookmark();
	}

	return {
		bindEventListeners,
	};
}());