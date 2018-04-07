import gql from 'graphql-tag';

export default gql`

mutation DeleteEvent($id: ID!){
    deleteEvent(id:$id){
      __typename
      id
    }
}`;