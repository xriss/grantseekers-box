"use strict";
/* globals define, templates, ajaxify, bootbox, RELATIVE_PATH, utils, translator, socket */

define('groups', [
	'iconSelect',
	'admin/modules/colorpicker'
], function(iconSelect, colorpicker) {
	var Groups = {};

	Groups.spawnCreateForm = function() {
		templates.parse('partials/groups/manage', {}, function(template) {
			translator.translate(template, function(translatedHTML) {
				var modal = bootbox.dialog({
						title: 'New Group',
						message: translatedHTML,
						buttons: {
							discard: {
								label: 'Discard Changes',
								className: 'btn-link'
							},
							create: {
								label: 'Create Group',
								className: 'btn-primary disabled',
								callback: Groups.create
							}
						}
					}),
					saveEl = modal.find('.btn-primary'),
					formEl = modal.find('form');

				// Disable form elements unless a form value has changed
				saveEl.prop('disabled', true).removeClass('disabled');
				formEl.on('change', 'input', function() {
					saveEl.prop('disabled', false);
				});

				// Form related event handlers
				Groups.prepareSettings(formEl);
			});
		});
	};

	Groups.spawnManageForm = function(current) {
		var data = {
				current: current || {
					name: ajaxify.variables.get('group_name'),
					description: ajaxify.variables.get('group_description'),
					category: ajaxify.variables.get('group_category'),
					privacy: parseInt(ajaxify.variables.get('group_privacy'), 10) === 1,
					hidden: parseInt(ajaxify.variables.get('group_hidden'), 10) === 1
				}
			};

		templates.parse('partials/groups/manage', data, function(template) {
			translator.translate(template, function(translatedHTML) {
				var modal = bootbox.dialog({
						title: 'Edit Group',
						message: translatedHTML,
						buttons: {
							discard: {
								label: 'Discard Changes',
								className: 'btn-link'
							},
							create: {
								label: 'Update Group',
								className: 'btn-primary disabled',
								callback: Groups.update
							}
						}
					}),
					saveEl = modal.find('.btn-primary'),
					formEl = modal.find('form');

				// Disable form elements unless a form value has changed
				saveEl.prop('disabled', true).removeClass('disabled');
				formEl.on('change', 'input', function() {
					saveEl.prop('disabled', false);
				});

				// Add the current group's name to the modal
				modal.attr('data-group-name', data.current.name);

				// Populate pending members
				Groups.refreshPendingMembers(modal);

				// Form related event handlers
				Groups.prepareSettings(formEl);
			});
		});
	};

	Groups.prepareSettings = function(settingsFormEl) {
		var colorBtn = settingsFormEl.find('[data-action="color-select"]'),
			colorValueEl = settingsFormEl.find('[name="labelColor"]'),
			iconBtn = settingsFormEl.find('[data-action="icon-select"]'),
			previewEl = settingsFormEl.find('.label'),
			previewIcon = previewEl.find('i'),
			userTitleEl = settingsFormEl.find('[name="userTitle"]'),
			userTitleEnabledEl = settingsFormEl.find('[name="userTitleEnabled"]'),
			iconValueEl = settingsFormEl.find('[name="icon"]');

		// Add color picker to settings form
		colorBtn.ColorPicker({
			color: colorValueEl.val() || '#000',
			onChange: function(hsb, hex) {
				colorValueEl.val('#' + hex);
				previewEl.css('background-color', '#' + hex);
			},
			onShow: function(colpkr) {
				$(colpkr).css('z-index', 1051);
			}
		});

		// Add icon selection interface
		iconBtn.on('click', function() {
			iconSelect.init(previewIcon, function() {
				iconValueEl.val(previewIcon.val());
			});
		});

		// If the user title changes, update that too
		userTitleEl.on('keyup', function() {
			var icon = previewIcon.detach();
			previewEl.text(' ' + (this.value.trim() || settingsFormEl.find('#name').val()));
			previewEl.prepend(icon);
		});

		// Disable user title customisation options if the the user title itself is disabled
		userTitleEnabledEl.on('change', function() {
			var customOpts = $('.user-title-option input, .user-title-option button');

			if (this.checked) {
				customOpts.removeAttr('disabled');
				previewEl.removeClass('hide');
			} else {
				customOpts.attr('disabled', 'disabled');
				previewEl.addClass('hide');
			}
		});
	};

	Groups.handleAcceptReject = function() {
		var btnEl = $(this),
			modal = btnEl.parents('.modal'),
			userRow = btnEl.parents('[data-uid]'),
			uid = userRow.attr('data-uid'),
			action = btnEl.attr('data-action'),
			groupName = modal.attr('data-group-name');

		socket.emit('groups.' + action, {
			toUid: uid,
			groupName: ajaxify.variables.get('group_name')
		}, function(err) {
			if (!err) {
				Groups.refreshPendingMembers(modal);
			} else {
				app.alertError(err.message);
			}
		});
	};

	Groups.refreshPendingMembers = function(modal) {
		$.get(RELATIVE_PATH + '/api/groups/' + utils.slugify(modal.attr('data-group-name'))).success(function(apiData) {
			templates.parse('partials/groups/pending', {
				pending: apiData.group.pending
			}, function(html) {
				translator.translate(html, function(translatedHTML) {
					modal.find('#pending-members').html(translatedHTML).off('click').on('click', '[data-action]', Groups.handleAcceptReject);
				});
			});
		}).fail(function() {
			// Hide the pending users tab altogether
			modal.find('.nav li a[href="#pending"]').parent().remove();
		});
	};

	Groups.update = function(evt) {
		var modalEl = $(evt.target).parents('.modal'),
			formEl = modalEl.find('form'),
			settings = formEl.serializeObject(),
			checkboxes = formEl.find('input[type="checkbox"][name]');

		// Fix checkbox values
		checkboxes.each(function(idx, inputEl) {
			inputEl = $(inputEl);
			if (inputEl.length) {
				settings[inputEl.attr('name')] = inputEl.prop('checked');
			}
		});

		utils.parseFile(formEl.find('input[type="file"]'), function(imageData) {
			if (imageData) {
				settings.imageData = imageData;
			}

			socket.emit('groups.update', {
				groupName: modalEl.attr('data-group-name'),
				values: settings
			}, function(err) {
				if (err) {
					return app.alertError(err.message);
				}

				if (settings.name) {
					var pathname = window.location.pathname;
					pathname = pathname.substr(1, pathname.lastIndexOf('/'));
					ajaxify.go(pathname + utils.slugify(settings.name));
				} else {
					ajaxify.refresh();
				}

				app.alertSuccess('[[groups:event.updated]]');
				modalEl.modal('hide');
			});
		});

		return false;
	};

	return Groups;
});