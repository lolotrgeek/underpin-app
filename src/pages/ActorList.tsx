import React from 'react';
import { Button, Jumbotron } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import PayModal from '../components/PayModal';
import ActorCard from '../components/ActorCard';
import { useStore } from '../store/Provider';

const ActorList: React.FC = () => {
  const store = useStore();

  if (store.actors.length === 0) {
    return (
      <Jumbotron style={{ backgroundColor: '#fff' }}>
        <h1>Welcome</h1>
        <p className="lead">
          It's a ghost town in here. Get the party started by creating the first actor.
        </p>
        <p>
          <Button onClick={store.gotoCreate}>Create a Actor</Button>
        </p>
      </Jumbotron>
    );
  }

  return (
    <>
      <h2>
        <Button onClick={store.gotoCreate} className="mr-2 float-right">
          Create a Actor
        </Button>
      </h2>
      {store.sortedActors.map(actor => (
        <ActorCard key={actor.id} actor={actor} />
      ))}
      {store.showPayModal && <PayModal />}
    </>
  );
};

export default observer(ActorList);
