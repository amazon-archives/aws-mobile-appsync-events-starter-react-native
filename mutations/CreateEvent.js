import gql from 'graphql-tag';

export default gql`

mutation CreateEvent(
    $name: String!,
    $when: String!,
    $where: String!,
    $description: String!
  ){
    createEvent(name:$name, when:$when, where:$where, description:$description){
      __typename
      id
      name
      when
      where
      description
    }
}`;