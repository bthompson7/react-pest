import React, { Component } from 'react';
import ButtonClick from './button';

export default class Bug extends React.Component {
    constructor(props) {
        super(props);
       this.state = {
         data: '',
         pest: '',
         error:'',
         uploadError: false
       };
    }

    state = {
        uploading: false,
        images: []
      }

      onChange = e => {
        const files = Array.from(e.target.files)
        this.setState({ uploading: false })
        this.setState({ uploaded: false })
        this.setState({data: ""})
        this.setState({pest:""})
        this.setState({error:""})

        console.log("files = " + files[0]);
  
        //convert image to base64 to send to api
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

            //send base64 to api for detection
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({'img': rawLog})
            };
            fetch('http://192.168.1.4:3001/detect', requestOptions)
                .then(response => response.json())
                .then(function(response){
                    if(response.img_guess !== undefined){
                        console.log(response.img_guess)
                        this.setState({
                            data: response.img_guess,
                            pest: response.is_pest,
                            upload: false,
                            uploaded: true
    
                        })
                    }else{
                        console.log("invalid file type")
                        this.setState({
                            error: response.error,
                            uploadError: true,
                            upload: false,
                            uploaded: false
                        })
                    }
                   
                }.bind(this))
        }.bind(this);
     

    }

    render() {
        const { uploading, images,uploaded} = this.state
        var someData = this.state.data;
        var someData2 = this.state.pest
        var uploadErrorData = this.state.error
        var uploadErrorState = this.state.uploadError
    
        const apiData = () => {
            return (
                <header id="aboutHeader" className="App-info">
                <h1 class="success">I think it's a {someData}. Pest: {someData2}</h1>
                <ButtonClick/>
                </header>
            
            )
        }

        const fileUpload = () => {
           return (
           <input type='file' id='single-image' onChange={this.onChange} />
           )
        }

        const uploadErrorHappened = () =>{
            return (
            <header id="aboutHeader" className="App-info">
              <h1 class="error">Error: {uploadErrorData}</h1>
              <ButtonClick/>
             </header>
             
            )
        }
        const content = () => {
            
            switch(true) {
               case uploaded:
                return apiData()
                case uploadErrorState:
                 return uploadErrorHappened()
              default:
                return fileUpload()
            }
          }

        return(
            
          <header id="aboutHeader" className="App-header3">
            <h1>Bug Guesser</h1>
            <h2>Upload an image to see what bug it contains!</h2>
           {content()}
          </header>
          
        )

        
        
      }

      
    
}



