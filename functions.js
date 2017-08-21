// MultiSelect = require("react-selectize").MultiSelect

Form = React.createClass({displayName: "Form",
    
    // render :: a -> ReactElement
    render: function(){
        var self = this, 
            options = ["apple", "mango", "grapes", "melon", "strawberry"].map(function(fruit){
                return {label: fruit, value: fruit}
            });
        return React.createElement(MultiSelect, {options: options, placeholder: "Select fruits"})
    }
    
});

render(React.createElement(Form, null), mountNode)