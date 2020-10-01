import React from 'react';

export const Home = () => {
  return <div>home</div>;
};

class ChildComponent extends React.PureComponent<{
  onClick: React.MouseEventHandler;
}> {
  render() {
    console.log('ChildComponent render');

    const { onClick } = this.props;
    return <div onClick={onClick}>child</div>;
  }
}

class ParentComponent extends React.Component {
  state = {
    count: 0,
    arr: [] as number[]
  };

  handleChildClick = () => {
    console.log('handleChildClick called');

    const { count } = this.state;
    this.setState({ count: count + 2 });
  };

  handleParentClick = () => {
    console.log('handleParentClick called');

    // const { count } = this.state;
    // this.setState({ count: count + 1 });

    this.state.arr.push(1);
    this.setState({ arr: this.state.arr });
  };

  render() {
    console.log('ParentComponent render', this.state.count);
    return (
      <div>
        <div onClick={this.handleParentClick}>
          {process.env.URL_PREFIX}
          ParentComponent {this.state.count}
        </div>
        <div>{this.state.arr.length}</div>
        <ChildComponent onClick={this.handleChildClick} />
      </div>
    );
  }
}

export default ParentComponent;
