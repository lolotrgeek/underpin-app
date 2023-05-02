import React from 'react';
import { Badge, Card } from 'react-bootstrap';
import { Actor } from '../shared/types';
import VerifyButton from './VerifyButton';
import ActionButton from './ActionButton';

interface Props {
  actor: Actor;
}

const ActorCard: React.FC<Props> = ({ actor }) => {
  return (
    <Card key={actor.id} className="my-4">
      <Card.Body>
        <Card.Title>
          <strong>{actor.username}</strong>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Actored
          {actor.signature && ' and signed '}
          by {actor.username}
          {actor.verified && (
            <Badge pill variant="success" className="ml-2">
              verified
            </Badge>
          )}
        </Card.Subtitle>
        {/* <Card.Text>{actor.content}</Card.Text> */}
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <h5 className="mt-1">
          <Badge variant={actor.impact ? 'primary' : 'light'}>{actor.impact}</Badge> impact
        </h5>
        <span>
          <VerifyButton actor={actor} />
          <ActionButton actor={actor} />
        </span>
      </Card.Footer>
    </Card>
  );
};

export default ActorCard;
