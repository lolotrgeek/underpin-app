import React, { useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { Actor } from '../shared/types'
import { useStore } from '../store/Provider'

interface Props {
  actor: Actor
}

const ActionButton: React.FC<Props> = ({ actor }) => {
  const store = useStore()

  // create an invoice and show the modal when the button is clicked
  const handleActionClick = useCallback(async () => {
    await store.showPaymentRequest(actor)
  }, [store, actor])

  return (
    <Button variant="outline-primary" onClick={handleActionClick}>
      Action
    </Button>
  )
}

export default ActionButton
