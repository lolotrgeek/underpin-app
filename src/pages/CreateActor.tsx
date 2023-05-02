import React, { useCallback, useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/Provider'

const CreateActor: React.FC = () => {
  const store = useStore()

  const [name, setName] = useState(crypto.randomUUID().toString())

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault()
      store.createActor(name)
    },
    [name, store],
  )

  return (
    <Form onSubmit={handleSubmit}>
      <Card>
        <Card.Header>Create a new Post</Card.Header>
        <Card.Body>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
        <Card.Footer>
          <Row>
            <Col>
              <Button variant="outline-danger" onClick={store.gotoActors}>
                Cancel
              </Button>
            </Col>
            <Col className="text-right">
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    </Form>
  )
}

export default observer(CreateActor)
