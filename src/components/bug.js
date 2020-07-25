import React, { Component } from 'react';

export default class Bug extends React.Component {
    constructor(props) {
        super(props);
       this.state = {
         data: '',
         pest: ''
       };
    }

    state = {
        uploading: false,
        images: []
      }

      onChange = e => {
        const files = Array.from(e.target.files)
        this.setState({ uploading: true })
        this.setState({ uploaded: false })
        this.setState({data: ""})
        this.setState({pest:''})

        console.log("files = " + files[0]);
  
        let reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
        

        var rawLog;
        reader.onload = function(e) {
            var component = this;
            rawLog = reader.result;
            console.log(JSON.stringify({img: rawLog}));

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({'img': rawLog})
            };
            fetch('http://localhost:3001/detect', requestOptions)
                .then(response => response.json())
                .then(function(response){
                    console.log(response.img_guess)
                    this.setState({
                        data: response.img_guess,
                        pest: response.is_pest
                    })
                }.bind(this))
        }.bind(this);
        this.setState({ uploading: false })
        this.setState({ uploaded: true })

    }

    render() {
        const { uploading, images,uploaded} = this.state
        var someData = this.state.data;
        var someData2 = this.state.pest

        const content = () => {
            switch(true) {
              case uploading:
                return  <div><h1>{this.state.data}</h1></div>
               case uploaded:
                return <h1>I think it's a {someData}. Pest Status: {someData2}</h1>
              default:
                return <input type='file' id='single-image' onChange={this.onChange} />
            }
          }

        return(
          <header id="aboutHeader" className="App-header3">
           <h1>Bug Guesser</h1>
           {content()}
           <h1>{this.state.uploaded}</h1>
          </header>
          
        )

        
        
      }

      
    
}



