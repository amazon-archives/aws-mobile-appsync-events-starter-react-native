import gql from 'graphql-tag';

export default gql`

mutation CommentOnEvent(
    $eventId: ID!,
    $content: String!,
    $createdAt: String!
  ) {
      commentOnEvent(
        eventId:$eventId, 
        content:$content, 
        createdAt:$createdAt
      ) {
          __typename
          eventId
          commentId
          content
          createdAt 
        }
}`;