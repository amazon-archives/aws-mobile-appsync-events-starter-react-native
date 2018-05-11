import gql from "graphql-tag";

export default gql`
  query($eventId: ID!) {
    getEvent(id: $eventId) {
      __typename
      id
      name
      where
      when
      description
      comments {
        __typename
        items {
          eventId
          commentId
          content
          createdAt
        }
        nextToken
      }
    }
  }
`
