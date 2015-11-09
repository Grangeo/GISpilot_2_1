<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="Default.aspx.vb" Inherits="postgresql._Default" %>
<%@ Register assembly="System.Web.Entity, Version=3.5.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" namespace="System.Web.UI.WebControls" tagprefix="asp" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>Search</title>
<!--[if !IE]><!-->
	<link rel="stylesheet" type="text/css" href="not-ie.css" />
 <!--<![endif]-->
<link rel="stylesheet" type="text/css" href="style.css"/>
<script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>
</head>
<body>
    <form id="form1" runat="server">
    Search by&nbsp; 
    <asp:DropDownList ID="DropDownList1" runat="server" Width="106px">
        <asp:ListItem Value="allfields" Selected="True">All fields</asp:ListItem>
        <asp:ListItem Value="creator">Creator</asp:ListItem>
        <asp:ListItem Value="placename">Place name</asp:ListItem>
        <asp:ListItem Value="title">Title</asp:ListItem>
    </asp:DropDownList>
    <asp:TextBox ID="TextBox1" runat="server" Width="306px"></asp:TextBox>
    <br />Time period
    <asp:RadioButton ID="RadioButton1" runat="server" Text="before" 
        GroupName="TimePeriod" />
    <asp:RadioButton ID="RadioButton2" runat="server" Text="after" Checked="True" 
        GroupName="TimePeriod" /> &nbsp;year
    <asp:TextBox ID="TextBox2" runat="server" Width="35px"></asp:TextBox>
    &nbsp;showing <asp:RadioButton ID="RadioButton3" runat="server" Text="older" 
        GroupName="TimeOrder" />
    <asp:RadioButton ID="RadioButton4" runat="server" Text="newer " Checked="True" 
        GroupName="TimeOrder" />first
    <br />
    <asp:CheckBox ID="CheckBox1" runat="server" Checked="True" 
        Text="Limit results by last location" Visible="False" />
    <br />
    <asp:Button ID="Button1" runat="server" Text="Submit" Width="97px" />
    <br/><br/>
        <div class="images">
        <asp:ListView ID="ListView1" runat="server" DataKeyNames="IDC" 
            DataSourceID="SqlDataSource1" EnableModelValidation="True">
            <EmptyDataTemplate>
                <table id="Table1" runat="server" style="">
                    <tr>
                        <td>
                            No record matching the creteria was found.</td>
                    </tr>
                </table>
            </EmptyDataTemplate>
            <ItemTemplate>
		        <li class="item type-text">
			        <a href="<%#Eval("CONTEXT")%>"  target="_blank" ><div style="height:110px;overflow:hidden;"><asp:Image ID="Image1" ImageUrl=<%#Eval("THUMBNAIL")%> onError="this.onerror=null;this.src='res/noimg.png'" title=<%#Eval("TITLE")%> runat="server" data-type="text" Height="100%"/></div></a>
				        <h2><%#tooLongString1(Eval("TITLE"))%></h2>
				        <a id="EuropeanaLink" href="<%#Eval("CONTEXTG")%>" target="_blank" title="<%#Eval("PROVIDER")%>, <%#Eval("PROJECT")%>" class="info">
				        <%#tooLongString2(Eval("PROVIDER") & ", " & Eval("PROJECT"))%><br/>
				       <span></span><br/>
			        </a>
		        </li>
            </ItemTemplate>
            <LayoutTemplate>
                <table>
                    <tr>
                        <td>
                            <ul id="items">
			                    <asp:PlaceHolder runat="server" ID="itemPlaceholder"></asp:PlaceHolder>
		                    </ul>                          
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="numbers" style='color: rgb(0,0,0)' >
                                <asp:DataPager ID="DataPager1" PageSize="12" PagedControlID="ListView1" runat="server">
                                    <Fields>
                                        <asp:NumericPagerField NextPageImageUrl="res/right.png" PreviousPageImageUrl="res/left.png" ButtonType="Image" />
                                    </Fields>
                                </asp:DataPager>   
                                <asp:Label ID="Label1" runat="server" Text=""></asp:Label>
                            </div> 
                        </td>
                    </tr>
                </table>               
            </LayoutTemplate>
        </asp:ListView>
        </div>
        <br/>
 
        <asp:SqlDataSource ID="SqlDataSource1" runat="server" 
            ConnectionString="<%$ ConnectionStrings:template_postgisConnectionString %>" 
            ProviderName="<%$ ConnectionStrings:template_postgisConnectionString.ProviderName %>" 
            SelectCommand="SELECT gid, link, title, thumbnail FROM &quot;carare2&quot;">
        </asp:SqlDataSource>
           
    </form>
</body>
</html>
