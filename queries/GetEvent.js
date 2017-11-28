import gql from 'graphql-tag';

export default gql`

query GetEvent($id: ID!){
    getEvent(id:$id){
      __typename
      id
      name
      where
      when
      description
      comments{
        items{
          __typename
          eventId
          commentId
          content
          createdAt
        }
        nextToken
      }
    }
}`;