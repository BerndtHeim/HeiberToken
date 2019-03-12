pragma solidity ^0.5.0;

contract HeiberToken {    
    string public name = "HeiberToken";
    string public symbol = "HBR"; 
    string public standard = "Heiber Token v1.0";
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer (
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval (
        address indexed _owner,        
        address indexed _spender,
        uint256 _value
    );

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;        
        totalSupply = _initialSupply;                
    }

    function uint2str(uint _i) internal pure returns (string memory ) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, uint2str(balanceOf[msg.sender]));
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;     

        emit Transfer(msg.sender, _to, _value);   

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);   

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "value cannot be greater than 'froms' balance");
        require(_value <= allowance[_from][msg.sender], "value cannot be greater than the allowance");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;     

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);   

        return true;
    }    
}