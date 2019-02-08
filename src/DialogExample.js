import * as React from 'react'
import {
  Dialog,
  DialogFooter,
  DialogType,
} from 'office-ui-fabric-react/lib/Dialog'
import {
  DefaultButton,
  PrimaryButton,
} from 'office-ui-fabric-react/lib/Button'
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup'

export class DialogLargeHeaderExample extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hideDialog: true,
    }
  }

  render() {
    return (
      <div>
        <DefaultButton
          secondaryText="Opens the Sample Dialog"
          onClick={this._showDialog}
          text="Open Dialog"
        />
        <Dialog
          hidden={this.state.hideDialog}
          onDismiss={this._closeDialog}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: 'All emails together',
            subText:
              'Your Inbox has changed. No longer does it include favorites, it is a singular destination for your emails.',
          }}
          modalProps={{
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride',
          }}
        >
          <ChoiceGroup
            options={[
              {
                key: 'A',
                text: 'Option A',
              },
              {
                key: 'B',
                text: 'Option B',
                checked: true,
              },
              {
                key: 'C',
                text: 'Option C',
                disabled: true,
              },
            ]}
            onChange={this._onChoiceChanged}
          />
          <DialogFooter>
            <PrimaryButton onClick={this._closeDialog} text="Save" />
            <DefaultButton onClick={this._closeDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </div>
    )
  }

  _showDialog = () => {
    this.setState({ hideDialog: false })
  }

  _closeDialog = () => {
    this.setState({ hideDialog: true })
  }

  _onChoiceChanged() {
    console.log('Choice option change')
  }
}
