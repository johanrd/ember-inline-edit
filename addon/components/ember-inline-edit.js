import Component from '@ember/component'
import { set, computed } from '@ember/object'
import { htmlSafe } from '@ember/string'
import { run } from '@ember/runloop'
import { tryInvoke } from '@ember/utils'

import layout from '../templates/components/ember-inline-edit'

export default Component.extend({
  layout,
  classNames: ['ember-inline-edit'],
  classNameBindings: ['isEditing:is-editing', 'enabled::disabled'],

  isEditing: false,
  isNotEditing: computed.not('isEditing'),

  enabled: true,
  field: 'text',

  value: null,
  previousValue: null,

  placeholder: 'Not Provided',
  saveLabel: 'Save',
  cancelLabel: 'Cancel',
  editLabel: 'Edit',

  fieldWidth: null,

  showSaveButton: true,
  showCancelButton: true,

  editorClass: '',
  buttonContainerClass: '',
  editButtonClass: '',
  saveButtonClass: '',
  cancelButtonClass: '',

  didInsertElement() {
    this._super(...arguments)

    this._handleClicks = this._handleClicks.bind(this)
    document.addEventListener('click', this._handleClicks)
  },

  willDestroyElement() {
    document.removeEventListener('click', this._handleClicks)
  },

  _handleClicks(ev) {
    if (!this.enabled) return

    let { isEditing } = this
    let clickedInside = this.element.contains(ev.target)

    if (clickedInside && !isEditing) {
      if (this.showEditButton) {
        return
      }

      this._setFieldWidth()
      this.send('startEditing', ev)
    } else if (!clickedInside && isEditing) {
      this.send('cancel')
    }
  },

  _setFieldWidth() {
    const { width } = this.element.getBoundingClientRect()

    run(this, () => {
      set(this, 'fieldWidth', htmlSafe(`width: ${width + 2}px`))
    })
  },

  didReceiveAttrs() {
    if (this.enabled === false && this.isEditing) {
      this.send('cancel')
    }
  },

  actions: {
    save() {
      tryInvoke(this, 'onSave', [this.value])

      run(this, () => {
        set(this, 'isEditing', false)
      })
    },

    startEditing(e) {
      e.stopPropagation()
      tryInvoke(this, 'onEdit')

      run(this, () => {
        set(this, 'previousValue', this.value)
        set(this, 'isEditing', true)
      })
    },

    cancel() {
      tryInvoke(this, 'onCancel')

      run(this, () => {
        set(this, 'value', this.previousValue)
        set(this, 'isEditing', false)
      })
    }
  }
})
