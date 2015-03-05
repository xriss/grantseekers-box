"use strict";
/*global define, templates, socket, ajaxify, app, admin, bootbox, utils, config, translator */

define('admin/manage/groups', ['groups'], function(Groups) {
	var	ManageGroups = {};

	ManageGroups.init = function() {
		// Tooltips
		$('#groups-list .members li').tooltip();

		$('#groups-list').on('click', 'button[data-action]', function() {
			var el = $(this),
				action = el.attr('data-action'),
				groupName = el.parents('li[data-groupname]').attr('data-groupname');

			switch (action) {
			case 'delete':
				bootbox.confirm('Are you sure you wish to delete this group?', function(confirm) {
					if (confirm) {
						socket.emit('groups.delete', {
							groupName: groupName
						}, function(err, data) {
							if(err) {
								return app.alertError(err.message);
							}

							ajaxify.refresh();
						});
					}
				});
				break;
			case 'edit':
				socket.emit('admin.groups.get', groupName, function(err, groupObj) {
					console.log(groupObj);
					Groups.spawnManageForm(groupObj);
				});
				break;
			}
		});

	};

	return ManageGroups;
});
