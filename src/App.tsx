import React, { ReactNode, useEffect } from 'react'
import { Alert, Badge, Container, Dropdown, Nav, Navbar, NavLink } from 'react-bootstrap'
import { observer } from 'mobx-react-lite'
import Connect from './pages/Connect'
import CreateActor from './pages/CreateActor'
import ActorList from './pages/ActorList'
import { useStore } from './store/Provider'

function App() {
  const store = useStore()

  const pages: Record<string, ReactNode> = {
    actors: <ActorList />,
    create: <CreateActor />,
    connect: <Connect />,
  }

  useEffect(() => {
    console.log(typeof store.balance, store.balance)
    return () => console.log('unmounting...')
  }, [])

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md">
        <Navbar.Brand onClick={store.gotoActors}> Underpin</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            {!store.connected ? (
              <Nav.Item>
                <NavLink onClick={store.gotoConnect}>Connect to LND</NavLink>
              </Nav.Item>
            ) : (
              <>
                <Navbar.Text>
                  <Badge variant="info" pill className="mr-3">
                    {store.balance} sats
                  </Badge>
                </Navbar.Text>
                <Dropdown id="basic-nav-dropdown" alignRight>
                  <Dropdown.Toggle as={NavLink}>{store.alias}</Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={store.disconnect}>Disconnect</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="my-3">
        <div>
          {store.error && (
            <Alert variant="danger" dismissible onClose={store.clearError}>
              {store.error}
            </Alert>
          )}
          {pages[store.page]}
        </div>
      </Container>
    </>
  )
}

export default observer(App)