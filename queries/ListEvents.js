import gql from 'graphql-tag';

export default gql`
query ListEvents {
    listEvents{
      items{
        id
        name
        where
        when
        description
        comments{
          items{
            eventId
            commentId
            content
            createdAt
          }
        }
      }
    }
}`;