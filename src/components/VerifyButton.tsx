import React, { useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { Actor } from '../shared/types'
import { useStore } from '../store/Provider'

interface Props {
  actor: Actor
}

const VerifyButton: React.FC<Props> = ({ actor }) => {
  const store = useStore()

  const handleVerify = useCallback(() => {
    store.verifyActor(actor.id)
  }, [store, actor.id])

  if (actor.verified) {
    return null
  }

  return (
    <Button variant="light" className="mr-3" onClick={handleVerify}>
      Verify Signature
    </Button>
  )
}

export default VerifyButton
